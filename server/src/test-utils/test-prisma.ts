import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";
import { getTestDatabaseUrl } from "./test-database";

const adapter = new PrismaPg(
  { connectionString: getTestDatabaseUrl() },
  { schema: "miniledger_test" },
);

export const testPrisma = new PrismaClient({ adapter });