
import { env } from "../config/env";

export function getTestDatabaseUrl(): string {
  const testUrl = env.TEST_DATABASE_URL;

  if (!testUrl) {
    throw new Error(
      "TEST_DATABASE_URL is required to run database integration tests",
    );
  }

  if (
    testUrl === env.DATABASE_URL ||
    testUrl === env.DIRECT_URL
  ) {
    throw new Error(
      "TEST_DATABASE_URL must differ from DATABASE_URL and DIRECT_URL",
    );
  }

  return testUrl;
}
