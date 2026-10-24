import "dotenv/config";
import { defineConfig, env } from "prisma/config";
import { fileURLToPath } from "node:url";
import path from "node:path";

const configDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  schema: path.join(configDir, "prisma", "schema.prisma"),
  migrations: {
    path: path.join(configDir, "prisma", "test-migrations"),
  },
  datasource: {
    url: env("TEST_DATABASE_URL"),
  },
});