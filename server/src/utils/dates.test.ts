
import { describe, expect, test } from "@jest/globals";
import { fromDateString, toDateString } from "./dates";

describe("Date utilities", () => {
  test("converts a date string to UTC midnight", () => {
    const result = fromDateString("2026-10-25");

    expect(result.toISOString()).toBe("2026-10-25T00:00:00.000Z");
  });

  test("converts a Date to YYYY-MM-DD", () => {
    const result = toDateString(
      new Date("2026-10-25T00:00:00.000Z"),
    );

    expect(result).toBe("2026-10-25");
  });
});
