
import "dotenv/config";
import { readFile } from "node:fs/promises";
import pg from "pg";
import { getTestDatabaseUrl } from "./test-database";

const { Client } = pg;

async function main() {
  const client = new Client({
    connectionString: getTestDatabaseUrl(),
  });

  try {
    await client.connect();

    const databaseResult = await client.query(
      "SELECT current_database() AS database",
    );

    if (databaseResult.rows[0]?.database !== "neondb") {
      throw new Error("Unexpected database; refusing to continue");
    }

    await client.query('SET search_path TO "miniledger_test"');

    const schemaResult = await client.query(
      "SELECT current_schema() AS schema",
    );

    if (schemaResult.rows[0]?.schema !== "miniledger_test") {
      throw new Error("Unexpected schema; refusing to continue");
    }

    console.log("Verified test target:", {
      database: databaseResult.rows[0].database,
      schema: schemaResult.rows[0].schema,
    });

    const sql = await readFile("prisma/test-schema.sql", "utf8");

    await client.query("BEGIN");

    try {
      await client.query(sql);
      await client.query("COMMIT");
      console.log("Test schema setup completed.");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  } finally {
    await client.end();
  }
}

main().catch((error: unknown) => {
  console.error("Test schema setup failed:", error);
  process.exitCode = 1;
});
