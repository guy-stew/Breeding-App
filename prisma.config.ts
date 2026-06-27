// Prisma 7 moved database/CLI configuration out of schema.prisma
// and into this file. It belongs at the project root, next to
// package.json. The DATABASE_URL itself lives in a .env file
// (which you never commit to git).
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    // Lets `npx prisma db seed` find and run the seed script.
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Reads from your .env file, e.g.
    // DATABASE_URL="postgresql://user:pass@host:5432/breeding_app"
    url: env("DIRECT_URL"),
  },
});
