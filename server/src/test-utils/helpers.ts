/**
 * test-utils/helpers.ts
 *
 * loginAs(app, phone) — sends an OTP, intercepts the mock OTP from
 * the dev logger, verifies it, and returns the JWT token.
 *
 * createLoan(app, token, overrides) — creates a loan and returns its id.
 */
import request from "supertest";
import { jest } from "@jest/globals";
import type { Express } from "express";
import { logger } from "../utils/logger";

export async function loginAs(app: Express, phone: string): Promise<string> {
  const logSpy = jest.spyOn(logger, "info");

  const sendRes = await request(app)
    .post("/api/auth/send-otp")
    .send({ phone });

  if (sendRes.status !== 200) {
    throw new Error(`send-otp failed: ${JSON.stringify(sendRes.body)}`);
  }

  // Winston's info() receives a single object: { message, ...metadata }.
  // We look for the call whose message is "Mock OTP generated" and read otp off it.
  const calls = logSpy.mock.calls as Array<[Record<string, unknown>]>;
  const match = calls.find((args) => args[0]?.message === "Mock OTP generated");

  if (!match || typeof match[0].otp !== "string") {
    throw new Error("Could not capture mock OTP from logger.");
  }

  const otp = match[0].otp;

  const verifyRes = await request(app)
    .post("/api/auth/verify-otp")
    .send({ phone, otp });

  if (verifyRes.status !== 200) {
    throw new Error(`verify-otp failed: ${JSON.stringify(verifyRes.body)}`);
  }

  logSpy.mockRestore();
  return verifyRes.body.token as string;
}

/** Creates a loan and returns its id. */
export async function createLoan(
  app: Express,
  token: string,
  overrides: Record<string, unknown> = {},
) {
  const res = await request(app)
    .post("/api/loans")
    .set("Authorization", `Bearer ${token}`)
    .send({
      friendName: "Test Friend",
      amountPaise: 10000,
      dueDate: "2099-12-31",
      ...overrides,
    });

  if (res.status !== 201) {
    throw new Error(`createLoan failed: ${JSON.stringify(res.body)}`);
  }

  return res.body.data.id as string;
}
