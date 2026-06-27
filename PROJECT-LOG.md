# Breeding App — Project Log

A running notebook for the project: what's built, where each file lives, and
what's next. Keep this committed to GitHub so it's always in sync and you (or
anyone helping) can get oriented in seconds.

*Last updated: 27 June 2026 — two WRITE features live (weigh-in round + add a
dog), and GitHub → Vercel auto-deploy confirmed working.*

---

## What this app is

A private "digital filing cabinet" for a dog breeder's records (dogs, litters,
puppies, weights, health, compliance). Built so it can later grow money-maker
features (puppy contracts, buyer CRM, health certificates) and eventually a
public Pets4Homes-style marketplace. The guiding principle: **store every record
once, and re-arrange/print it differently** for each feature.

## The tech stack (and the plain-English version of each piece)

- **Next.js** — the framework that runs the app and renders the pages.
- **React** — how the screens are built (the visual components).
- **TypeScript** — JavaScript with a safety net that catches mistakes early.
- **Tailwind** — the styling shortcuts (the `className="..."` bits).
- **Prisma** — the translator between the app and the database. We describe
  tables in plain text (`schema.prisma`) and Prisma handles the SQL.
- **Supabase** — the actual database, living in the cloud (Postgres).
- **GitHub** — the backup + history of all the code.
- **Vercel** — hosts the live public website. Now auto-deploys on every push.

---

## Current status — ✅ App can READ and WRITE; live site auto-updates

- [x] Local dev environment set up (Node, VS Code, Git)
- [x] Next.js project created
- [x] Supabase database created (project: `breeding-app`, Europe region)
- [x] Prisma wired up (Prisma 7 — config in `prisma.config.ts`, not schema)
- [x] Database tables created via `npx prisma migrate dev`
- [x] Sample data loaded via `npx prisma db seed`
- [x] Home screen reads live data and renders in the browser
- [x] Code pushed to GitHub (`guy-stew/Breeding-App`)
- [x] Live on Vercel (breeding-app.vercel.app)
- [x] **First WRITE feature: weigh-in round** — log each puppy's weight, saved
      to the database, screen refreshes to show it. (First genuinely useful tool.)
- [x] **Second WRITE feature: add a dog** — a form at `/dogs/new` creates a new
      Dog record; on save it redirects home where the dog appears in "My dogs".
- [x] **GitHub → Vercel auto-deploy confirmed** — every `git push` to `main`
      rebuilds the live site automatically (~1 minute). No more manual deploys.

**The app can now READ and WRITE data, and the live site stays in sync with
GitHub by itself.** Next: login (so it's not always the first breeder), then
more screens.

---

## File map — what lives where

Everything sits inside the `breeding-app` folder. The important pieces:

```
breeding-app/
├── .env                     ← DATABASE secrets. NEVER goes to GitHub. (gitignored)
├── prisma.config.ts         ← Prisma 7 settings (points CLI at DIRECT_URL)
├── prisma/
│   ├── schema.prisma        ← the data model: every table + field, in plain text
│   ├── seed.ts              ← fills the DB with sample data (Maple, Rufus, 7 pups)
│   └── migrations/          ← auto-generated record of every DB change
├── src/
│   ├── app/
│   │   ├── page.tsx         ← the HOME SCREEN (reads dogs + active litter)
│   │   ├── actions.ts       ← SERVER ACTIONS (logWeight + addDog live here)
│   │   ├── weigh-in/
│   │   │   ├── page.tsx     ← the WEIGH-IN ROUND screen (lists pups in order)
│   │   │   └── WeighInRow.tsx ← one puppy's input row (client component)
│   │   └── dogs/
│   │       └── new/
│   │           ├── page.tsx      ← the ADD-A-DOG screen
│   │           └── AddDogForm.tsx ← the dog form (client component)
│   ├── lib/
│   │   └── prisma.ts        ← the shared database connection helper
│   └── generated/prisma/    ← auto-built by `npx prisma generate` (don't hand-edit)
└── PROJECT-LOG.md           ← this file
```

### Which files were hand-built vs auto-generated

- **Hand-built (the real work):** `schema.prisma`, `seed.ts`, `page.tsx`,
  `actions.ts`, `weigh-in/page.tsx`, `weigh-in/WeighInRow.tsx`,
  `dogs/new/page.tsx`, `dogs/new/AddDogForm.tsx`, `prisma.ts`,
  `prisma.config.ts`. These are the files that define the app.
- **Auto-generated (don't edit by hand):** everything in `migrations/` and
  `src/generated/`. These are created by Prisma commands and rebuild themselves.

---

## How "writing data" works (the pattern to copy for future features)

The weigh-in round is the worked example of writing to the database. Three parts:

1. **A server action** (`src/app/actions.ts`) — a function marked `"use server"`
   that ALWAYS runs on the server. It takes what was typed, checks it makes sense,
   and saves it via Prisma. Think of it as the clerk behind the filing-cabinet slot.
2. **A client component** (`WeighInRow.tsx`, marked `"use client"`) — the
   interactive bit in the browser: the input box and Save button. It calls the
   server action when you save.
3. **A refresh** — after saving, the action calls `revalidatePath(...)` so the
   screen re-reads and shows the new data straight away.

Any future "add / edit" feature follows this same shape: form (client) → server
action → Prisma write → revalidate.

---

## The commands worth remembering

**Save your work to GitHub** (the everyday loop — now also deploys the live site):

```
git add .
git commit -m "describe what changed"
git push
```

**See the app in the browser** (start the local server):

```
npm run dev
```

Then open http://localhost:3000 — press Ctrl+C in the terminal to stop it.

**After changing `schema.prisma`** (update the database to match):

```
npx prisma migrate dev --name describe-the-change
```

**After any schema change, also rebuild the client** (so the app sees new fields):

```
npx prisma generate
```

**Re-load the sample data** (wipes and re-seeds):

```
npx prisma db seed
```

**Browse the database by hand** (a little built-in admin page):

```
npx prisma studio
```

---

## Hard-won gotchas (things that already bit us — don't get bitten twice)

- **`.env` square brackets:** the connection strings from Supabase come with
  `[YOUR-PASSWORD]` placeholders. Remove the brackets AND paste the real
  password — into BOTH `DATABASE_URL` and `DIRECT_URL`.
- **Two URLs, two ports:** `DATABASE_URL` uses port **6543** (pooled, for the
  running app); `DIRECT_URL` uses **5432** (direct, for Prisma CLI/migrations).
  Swapping them is the classic mistake.
- **Run `npx prisma generate` before seeding or running the app** the first time,
  or after any schema change — otherwise the app can't find the generated client
  (the `MODULE_NOT_FOUND` error we hit).
- **Vercel needs its OWN copy of the env vars.** `.env` is gitignored, so it
  never reaches GitHub or Vercel. The live site's database secrets live in
  Vercel → Settings → Environment Variables (`DATABASE_URL` + `DIRECT_URL`).
  If the live site builds but can't load data, this is the first thing to check.
- **Weights are stored in GRAMS as whole numbers** (`weightG Int`). Integers
  avoid tiny rounding errors ("float drift"). The weigh-in form lets you type
  g or kg and converts before saving — a 4.5kg pup is stored as 4500. Round on
  the way IN, always.
- **Weights attach to the DOG, not the Puppy** (`WeightLog.dogId`). That's
  deliberate: a kept puppy keeps one continuous weight history into adulthood.
  When writing a weight we use `puppy.dogId`, not `puppy.id`.
- **GitHub no longer accepts your password** for pushes. The sign-in window
  ("Sign in with your browser") handles it once, then remembers you.
- **GitHub repo names are case-sensitive** — the remote URL must match exactly
  (ours is `Breeding-App` with capitals).
- **A folder's name IS the URL (and 404s when it's wrong).** In Next.js, the URL
  `/dogs/new` must map to a file at exactly `src/app/dogs/new/page.tsx`. The
  folder names are the route. A misnamed folder (e.g. `dog` instead of `dogs`)
  or a page file not named exactly `page.tsx` gives a "404 — page not found".
  First thing to check when a new screen 404s: the folder spelling and the
  `page.tsx` filename.
- **Prisma 7 is very new** — most online tutorials show v6. Trust our setup over
  older guides for anything about the database connection.

---

## Next steps (roughly in order of value)

1. **Add login (Supabase Auth)** — so the app knows which breeder is signed in,
   instead of always grabbing the first one (`findFirst`). Once this is in,
   every "first breeder" shortcut becomes "the logged-in breeder". (This shows
   up in two places now: the home screen and the addDog action.)
2. **Build out more screens** — a litter detail page, a puppy growth chart (the
   weigh-in data is already being collected for exactly this), a dog profile
   page (and an "edit dog" form for the fields the quick add-form leaves out).
3. **The paperwork engine** — auto-filled puppy contracts and info packs
   (the first real "wow"). Use lawyer-reviewed templates, not free-form AI.

---

## Notes for picking this back up

When starting a fresh session, share this file first — it gives the full picture
in one go. The schema in `prisma/schema.prisma` is the source of truth for the
data model. Two worked examples now exist to copy from: `src/app/page.tsx` shows
how to READ data and render it; `src/app/actions.ts` + `src/app/weigh-in/`
shows how to WRITE data. Anything new tends to follow one of those two patterns.
