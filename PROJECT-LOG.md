# Breeding App — Project Log

A running notebook for the project: what's built, where each file lives, and
what's next. Keep this committed to GitHub so it's always in sync and you (or
anyone helping) can get oriented in seconds.

*Last updated: 27 June 2026 — all planned milestones complete. The app covers
the full breeding cycle, buyer management, health records, heat cycle tracking,
and a public marketplace. Login required for breeder pages; marketplace is
public.*

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
- **Supabase** — the actual database (Postgres) AND the login system (Auth).
- **Recharts** — the charting library (puppy growth chart on the litter page).
- **GitHub** — the backup + history of all the code.
- **Vercel** — hosts the live public website. Now auto-deploys on every push.

---

## Current status — ✅ Full breeding cycle workflow live

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
- [x] **Login (Supabase Auth)** — email/password sign-in and sign-up. Middleware
      redirects unauthenticated users to `/login`. Every page now shows the
      logged-in breeder's data, not the first breeder's. Sign-out button on
      home screen.
- [x] **Dog profile page** (`/dogs/[id]`) — full details, parents, weight
      history, paperwork links. Dogs on the home screen are now clickable.
- [x] **Edit dog** (`/dogs/[id]/edit`) — all fields including registered name,
      markings, KC registration number. Saves via `updateDog` server action.
- [x] **Litter detail page** (`/litters/[id]`) — summary card (whelp date,
      status, parents), weigh-in shortcut, and all puppies with latest weights.
      Litter name on home screen links here.
- [x] **Puppy growth chart** — Recharts line chart on the litter detail page.
      One line per puppy, colour-coded by collar colour, with tooltips. Shows
      weight trends and dips at a glance.
- [x] **Puppy contract** (`/dogs/[id]/contract`) — enter buyer details, preview
      a filled sale contract (parties, puppy description, parentage, breeder
      declarations, buyer responsibilities, return policy, signatures), then
      print or save as PDF.
- [x] **Puppy info pack** (`/dogs/[id]/info-pack`) — auto-filled printable
      document: puppy details, parentage, full weight record, feeding guide,
      healthcare record table, microchip info, breeder contact.

- [x] **Litter management** — full workflow: record a new mating + litter
      (`/litters/new`), edit litter details and status (`/litters/[id]/edit`),
      add individual puppies (`/litters/[id]/add-puppy`). Home screen shows
      "+ Record a new litter" when no active litter, or "+ New litter" link
      when one exists. Litter detail page has Edit and + Add puppy buttons.

- [x] **Buyer CRM** — Buyer model with status tracking (enquiry → waitlist →
      deposit paid → collected). Full CRUD: buyers list (`/buyers`), add buyer
      (`/buyers/new`), buyer profile (`/buyers/[id]`), edit buyer
      (`/buyers/[id]/edit`). Assign a buyer to any puppy via a dropdown on the
      litter detail page. Contract page pre-fills buyer details when a buyer is
      linked. "Buyers" quick link on home screen. Generate contract shortcut on
      buyer profile page.

- [x] **Health records** — HealthRecord model with 9 types (vaccination,
      worming, flea treatment, vet check, DNA test, hip score, elbow score,
      eye test, other). Add record form at `/dogs/[id]/health/new` with
      contextual placeholders. Dog profile shows full health history with
      next-due dates. Info pack healthcare table auto-fills from real records
      (falls back to blank rows when empty).

- [x] **Heat cycle tracking** — HeatCycle and ProgesteroneTest models. Record
      heat cycles for bitches (`/dogs/[id]/heat-cycles/new`), view cycle detail
      with progesterone test log and Recharts chart (`/dogs/[id]/heat-cycles/[cycleId]`).
      Reference lines at 2 ng/ml (LH surge) and 5 ng/ml (ovulation). Auto-calculates
      predicted whelp date (ovulation + 63 days). Inline form to add test results.
      Dog profile shows heat cycles section for bitches only.

- [x] **Public marketplace** — Listing model linked to Puppy. Breeder manages
      listings at `/listings` (create, toggle status active/sold/withdrawn).
      Public-facing marketplace at `/marketplace` (no login required) with card
      grid of active listings. Detail page at `/marketplace/[id]` shows puppy
      details, parentage, health checks, and breeder contact with email/call
      buttons. Middleware updated to allow `/marketplace` without auth.
      "Listings" quick link on home screen.

**All planned milestones complete.** The app now supports the full workflow:
add dogs → record matings and litters → add puppies → track daily weights →
view growth charts → log health records → track heat cycles with progesterone
→ manage buyers → assign buyers to puppies → generate pre-filled contracts
and info packs → publish puppies to the public marketplace.

---

## File map — what lives where

Everything sits inside the `breeding-app` folder. The important pieces:

```
breeding-app/
├── .env                     ← DATABASE + AUTH secrets. NEVER goes to GitHub. (gitignored)
├── prisma.config.ts         ← Prisma 7 settings (points CLI at DIRECT_URL)
├── prisma/
│   ├── schema.prisma        ← the data model: every table + field, in plain text
│   ├── seed.ts              ← fills the DB with sample data (Maple, Rufus, 7 pups)
│   └── migrations/          ← auto-generated record of every DB change
├── src/
│   ├── middleware.ts        ← AUTH GATE — refreshes session, redirects to /login if not signed in
│   ├── app/
│   │   ├── page.tsx         ← the HOME SCREEN (reads dogs + active litter)
│   │   ├── actions.ts       ← SERVER ACTIONS (logWeight, addDog, updateDog,
│   │   │                       createLitter, updateLitter, addPuppy,
│   │   │                       createBuyer, updateBuyer, assignBuyer,
│   │   │                       addHealthRecord, deleteHealthRecord,
│   │   │                       createHeatCycle, addProgesteroneTest,
│   │   │                       createListing, updateListingStatus)
│   │   ├── SignOutButton.tsx ← sign-out link (client component)
│   │   ├── login/
│   │   │   ├── page.tsx     ← the LOGIN PAGE
│   │   │   └── LoginForm.tsx ← sign-in / sign-up form (client component)
│   │   ├── auth/
│   │   │   └── callback/
│   │   │       └── route.ts ← handles email-confirmation redirects
│   │   ├── weigh-in/
│   │   │   ├── page.tsx     ← the WEIGH-IN ROUND screen (lists pups in order)
│   │   │   └── WeighInRow.tsx ← one puppy's input row (client component)
│   │   ├── dogs/
│   │   │   ├── new/
│   │   │   │   ├── page.tsx      ← the ADD-A-DOG screen
│   │   │   │   └── AddDogForm.tsx ← the dog form (client component)
│   │   │   └── [id]/
│   │   │       ├── page.tsx      ← DOG PROFILE (details, parents, weights)
│   │   │       ├── edit/
│   │   │       │   ├── page.tsx      ← EDIT DOG screen
│   │   │       │   └── EditDogForm.tsx ← edit form (client component)
│   │   │       ├── health/
│   │   │       │   └── new/
│   │   │       │       ├── page.tsx      ← ADD HEALTH RECORD
│   │   │       │       └── AddHealthRecordForm.tsx ← form (client component)
│   │   │       ├── heat-cycles/
│   │   │       │   ├── new/
│   │   │       │   │   ├── page.tsx      ← RECORD HEAT CYCLE
│   │   │       │   │   └── NewHeatCycleForm.tsx ← form (client component)
│   │   │       │   └── [cycleId]/
│   │   │       │       ├── page.tsx      ← CYCLE DETAIL (summary, tests, chart)
│   │   │       │       ├── ProgesteroneChart.tsx ← Recharts chart (client)
│   │   │       │       └── AddProgTestForm.tsx ← inline test form (client)
│   │   │       ├── contract/
│   │   │       │   ├── page.tsx      ← CONTRACT GENERATOR
│   │   │       │   └── ContractView.tsx ← buyer form + contract preview (client)
│   │   │       └── info-pack/
│   │   │           ├── page.tsx      ← INFO PACK (printable)
│   │   │           └── PrintButton.tsx ← print trigger (client component)
│   │   ├── listings/
│   │   │   ├── page.tsx        ← MY LISTINGS (manage, toggle status)
│   │   │   ├── ListingStatusButton.tsx ← status dropdown (client component)
│   │   │   └── new/
│   │   │       ├── page.tsx    ← NEW LISTING (pick puppy, add details)
│   │   │       └── NewListingForm.tsx ← form (client component)
│   │   ├── marketplace/
│   │   │   ├── page.tsx        ← PUBLIC MARKETPLACE (no auth, card grid)
│   │   │   └── [id]/
│   │   │       └── page.tsx    ← LISTING DETAIL (puppy, parents, breeder)
│   │   ├── buyers/
│   │   │   ├── page.tsx        ← BUYERS LIST (all buyers with status badges)
│   │   │   ├── BuyerForm.tsx   ← shared create/edit form (client component)
│   │   │   ├── new/
│   │   │   │   └── page.tsx    ← ADD BUYER screen
│   │   │   └── [id]/
│   │   │       ├── page.tsx    ← BUYER PROFILE (details, linked puppies)
│   │   │       └── edit/
│   │   │           └── page.tsx ← EDIT BUYER screen
│   │   └── litters/
│   │       ├── new/
│   │       │   ├── page.tsx      ← NEW LITTER (pick parents, enter details)
│   │       │   └── NewLitterForm.tsx ← litter form (client component)
│   │       └── [id]/
│   │           ├── page.tsx      ← LITTER DETAIL (summary, puppies, chart)
│   │           ├── GrowthChart.tsx ← Recharts line chart (client component)
│   │           ├── AssignBuyer.tsx ← buyer dropdown per puppy (client component)
│   │           ├── edit/
│   │           │   ├── page.tsx      ← EDIT LITTER screen
│   │           │   └── EditLitterForm.tsx ← edit form (client component)
│   │           └── add-puppy/
│   │               ├── page.tsx      ← ADD PUPPY to litter
│   │               └── AddPuppyForm.tsx ← puppy form (client component)
│   ├── lib/
│   │   ├── prisma.ts        ← the shared database connection helper
│   │   ├── breeder.ts       ← getBreeder() — finds the Breeder for the logged-in user
│   │   └── supabase/
│   │       ├── server.ts    ← Supabase client for server-side code (reads cookies)
│   │       └── client.ts    ← Supabase client for browser-side code
│   └── generated/prisma/    ← auto-built by `npx prisma generate` (don't hand-edit)
└── PROJECT-LOG.md           ← this file
```

### Which files were hand-built vs auto-generated

- **Hand-built (the real work):** everything listed in the file map above
  except the `generated/` folder. These are the files that define the app.
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

## How login works (the pattern for "who is this user?")

Three layers make login work:

1. **Middleware** (`src/middleware.ts`) — runs on EVERY page request. It refreshes
   the Supabase session cookie and, if the user isn't logged in, redirects them
   to `/login`. The login page itself is excluded so you don't get stuck in a loop.
2. **`getBreeder()`** (`src/lib/breeder.ts`) — the one function every page calls
   instead of the old `findFirst`. It reads the Supabase session to find out who's
   logged in, then looks up their Breeder record. On first login it auto-links by
   email, or creates a fresh Breeder if no match exists.
3. **Login form** (`src/app/login/LoginForm.tsx`) — a client component that calls
   Supabase Auth's `signInWithPassword` or `signUp`. On success it redirects to
   the home screen.

Any new page that needs to know the breeder just calls `const breeder = await
getBreeder()` at the top. If it returns null, redirect to `/login`.

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
- **Vercel needs ALL four env vars.** After adding auth, the live site needs
  `DATABASE_URL`, `DIRECT_URL`, `NEXT_PUBLIC_SUPABASE_URL`, and
  `NEXT_PUBLIC_SUPABASE_ANON_KEY` — all with actual values (not empty). If any
  are missing or blank, the middleware crashes with `MIDDLEWARE_INVOCATION_FAILED`.
- **Restart `npm run dev` after `prisma generate`.** The dev server caches the
  Prisma client in memory. If you add a new field and run `prisma generate`, the
  dev server won't see it until you stop (Ctrl+C) and restart `npm run dev`.

---

## Next steps (all original milestones complete — future ideas)

1. **Photo uploads** — puppy photos on listings, dog profiles, and info packs.
2. **Welfare checks** — timestamped litter welfare visits (the WelfareCheck
   stub is reserved in the schema).
3. **Document generation** — save contracts and info packs as stored records
   rather than just print-on-demand.
4. **Multi-breeder** — support co-owned dogs and shared litter access.
5. **Notifications** — email/push reminders for upcoming vaccinations,
   progesterone tests, and whelp dates.

---

## Notes for picking this back up

When starting a fresh session, share this file first — it gives the full picture
in one go. The schema in `prisma/schema.prisma` is the source of truth for the
data model. Worked examples exist for every pattern:

- **READ:** `src/app/page.tsx` — fetch the breeder's data and render it.
- **WRITE:** `src/app/actions.ts` + `src/app/weigh-in/` — form → server action → Prisma → revalidate.
- **AUTH:** `src/lib/breeder.ts` + `src/middleware.ts` — how the app knows who's logged in.
- **DETAIL PAGE:** `src/app/dogs/[id]/page.tsx` — dynamic route with Prisma includes.
- **EDIT FORM:** `src/app/dogs/[id]/edit/` — pre-filled form → updateDog action → redirect.
- **PRINTABLE DOC:** `src/app/dogs/[id]/info-pack/` — server-rendered, print CSS hides chrome.
- **CHART:** `src/app/litters/[id]/GrowthChart.tsx` — Recharts client component fed from server data.
- **MULTI-CREATE:** `src/app/litters/new/` — creates two linked records (Mating + Litter) in one action.
- **CRM / ASSIGN:** `src/app/buyers/` + `AssignBuyer.tsx` — CRUD pages, dropdown assigns buyer to puppy, contract pre-fills.
- **HEALTH:** `src/app/dogs/[id]/health/new/` — typed record form, info pack auto-fills from real data.
- **HEAT CYCLE:** `src/app/dogs/[id]/heat-cycles/` — cycle + progesterone tests, Recharts chart, predicted whelp date.
- **MARKETPLACE:** `src/app/marketplace/` — public pages (no auth), `src/app/listings/` — breeder management.

Any new page starts with `const breeder = await getBreeder()` and follows one
of those patterns.
