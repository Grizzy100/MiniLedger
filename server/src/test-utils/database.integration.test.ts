import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";
import { getTestDatabaseUrl } from "./test-database";
import { afterAll, describe, expect, test } from "@jest/globals";

const adapter = new PrismaPg(
  { connectionString: getTestDatabaseUrl() },
  { schema: "miniledger_test" },
);

const prisma = new PrismaClient({ adapter });

describe("Database constraints", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  test(
    "rejects a loan with a zero amount",
    async () => {
      const phone = `+919${String(Date.now()).slice(-9)}`;
      let userId: string | undefined;

      try {
        const user = await prisma.user.create({
          data: { phone },
        });

        userId = user.id;

        await expect(
          prisma.loan.create({
            data: {
              userId: user.id,
              friendName: "Test Friend",
              amountPaise: 0,
              dueDate: new Date("2026-12-31T00:00:00.000Z"),
            },
          }),
        ).rejects.toThrow();
      } finally {
        if (userId) {
          await prisma.user.delete({ where: { id: userId } });
        }
      }
    },
    20_000,
  );
});
