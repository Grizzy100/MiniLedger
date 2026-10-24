// prisma.config.ts
//
// Prisma CLI reads this file when you run any prisma command.
// This is the ONE place allowed to read process.env directly —
// it runs inside the Prisma CLI, separately from the Express app,
// so it cannot import config/env.ts.
//
// The `env()` helper from "prisma/config" reads process.env and
// throws a clear error if the variable is missing.

// import "dotenv/config"; // loads server/.env before env() runs
// import { defineConfig, env } from "prisma/config";

// export default defineConfig({
//   // Where the Prisma schema file lives
//   schema: "prisma/schema.prisma",

//   // Where "prisma migrate dev" writes new migrations
//   migrations: {
//     path: "prisma/migrations",
//   },

//   // DATABASE_URL is the Neon direct connection string (host without "-pooler").
//   // The same URL is used by the running app (PrismaPg adapter) and by
//   // prisma migrate. If "migrate dev" complains about a missing shadow database,
//   // add SHADOW_DATABASE_URL here pointing to a second Neon database.
//   datasource: {
//     url: env("DIRECT_URL"),
//   },
// });



import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",

  migrations: {
    path: "prisma/migrations",
  },

  datasource: {
    url: env("DIRECT_URL"),
  },
});