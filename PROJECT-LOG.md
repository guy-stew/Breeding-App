# Breeding App — Project Log

A running notebook for the project: what's built, where each file lives, and
what's next. Keep this committed to GitHub so it's always in sync and you (or
anyone helping) can get oriented in seconds.

*Last updated: 27 June 2026 — first working app pushed to GitHub.*

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
- **Vercel** — *(not set up yet)* will host the live public website.

---

## Current status — ✅ Foundation working

- [x] Local dev environment set up (Node, VS Code, Git)
- [x] Next.js project created
- [x] Supabase database created (project: `breeding-app`, Europe region)
- [x] Prisma wired up (Prisma 7 — config in `prisma.config.ts`, not schema)
- [x] Database tables created via `npx prisma migrate dev`
- [x] Sample data loaded via `npx prisma db seed`
- [x] Home screen reads live data and renders in the browser
- [x] Code pushed to GitHub (`guy-stew/Breeding-App`)

**Right now the app can READ data but cannot WRITE it.** That's the next big step.

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
│   │   └── page.tsx         ← the HOME SCREEN (reads dogs + active litter)
│   ├── lib/
│   │   └── prisma.ts        ← the shared database connection helper
│   └── generated/prisma/    ← auto-built by `npx prisma generate` (don't hand-edit)
└── PROJECT-LOG.md           ← this file
```

### Which files were hand-built vs auto-generated

- **Hand-built (the real work):** `schema.prisma`, `seed.ts`, `page.tsx`,
  `prisma.ts`, `prisma.config.ts`. These are the files that define the app.
- **Auto-generated (don't edit by hand):** everything in `migrations/` and
  `src/generated/`. These are created by Prisma commands and rebuild themselves.

---

## The commands worth remembering

**Save your work to GitHub** (the everyday loop):
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
- **GitHub no longer accepts your password** for pushes. The sign-in window
  ("Sign in with your browser") handles it once, then remembers you.
- **GitHub repo names are case-sensitive** — the remote URL must match exactly
  (ours is `Breeding-App` with capitals).
- **Prisma 7 is very new** — most online tutorials show v6. Trust our setup over
  older guides for anything about the database connection.

---

## Next steps (roughly in order of value)

1. **Make the app WRITE data** — a button to log a puppy's weight, or add a dog.
   This is the first genuinely useful feature. Needs a "server action."
2. **Connect GitHub → Vercel** — gives the app a real public web address that
   auto-updates on every `git push`. (Payoff of all the GitHub setup.)
3. **Add login (Supabase Auth)** — so the app knows which breeder is signed in,
   instead of just grabbing the first one.
4. **Build out more screens** — a litter detail page, a weigh-in round, a dog
   profile. All read from the foundation that already exists.
5. **The paperwork engine** — auto-filled puppy contracts and info packs
   (the first real "wow"). Use lawyer-reviewed templates, not free-form AI.

---

## Notes for picking this back up

When starting a fresh session, share this file first — it gives the full picture
in one go. The schema in `prisma/schema.prisma` is the source of truth for the
data model; the home screen in `src/app/page.tsx` is the worked example of how to
read data and render it. Anything new tends to follow that same pattern.
