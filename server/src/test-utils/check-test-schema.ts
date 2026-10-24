
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";
import { getTestDatabaseUrl } from "./test-database";

const adapter = new PrismaPg(
  { connectionString: getTestDatabaseUrl() },
  { schema: "miniledger_test" },
);

const prisma = new PrismaClient({ adapter });

try {
  const result = await prisma.$queryRaw<
    { database: string; schema: string }[]
  >`SELECT current_database() AS database, current_schema() AS schema`;

  console.log(result);
} finally {
  await prisma.$disconnect();
}
