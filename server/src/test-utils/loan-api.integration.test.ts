import request from "supertest";
import {
  afterAll,
  beforeAll,
  describe,
  expect,
  jest,
  test,
} from "@jest/globals";
import { createApp } from "../app";
import { logger } from "../utils/logger";

const app = createApp();
const phone = "+919" + String(Date.now()).slice(-9);
let token = "";

describe("Loan API integration tests", () => {
  beforeAll(async () => {
    const otpLogger = jest.spyOn(logger, "info");
    const otpResponse = await request(app)
      .post("/api/auth/send-otp")
      .send({ phone });

    expect(otpResponse.status).toBe(200);

    const otpCalls = otpLogger.mock.calls as unknown as Array<
      [unknown, unknown]
    >;
    const otpLog = otpCalls.find(
      ([message]) => message === "Mock OTP generated",
    );
    const metadata = otpLog?.[1];

    if (
      !metadata ||
      typeof metadata !== "object" ||
      !("otp" in metadata) ||
      typeof metadata.otp !== "string"
    ) {
      throw new Error(
        "The generated OTP was not captured from the development logger.",
      );
    }

    const generatedOtp = metadata.otp;
    const loginResponse = await request(app)
      .post("/api/auth/verify-otp")
      .send({ phone, otp: generatedOtp });

    expect(loginResponse.status).toBe(200);
    token = loginResponse.body.token;
    expect(token).toBeTruthy();
  });

  test("creates and lists a loan, then updates repayment summary", async () => {
    const createResponse = await request(app)
      .post("/api/loans")
      .set("Authorization", `Bearer ${token}`)
      .send({
        friendName: "Integration Test Friend",
        amountPaise: 12500,
        dueDate: "2026-12-31",
      });

    expect(createResponse.status).toBe(201);
    const loanId = createResponse.body.data.id;
    expect(loanId).toBeTruthy();

    const listResponse = await request(app)
      .get("/api/loans")
      .set("Authorization", `Bearer ${token}`);

    expect(listResponse.status).toBe(200);
    expect(
      listResponse.body.data.some(
        (loan: { id: string }) => loan.id === loanId,
      ),
    ).toBe(true);

    const beforeRepayment = await request(app)
      .get("/api/loans/summary")
      .set("Authorization", `Bearer ${token}`);

    expect(beforeRepayment.status).toBe(200);
    expect(beforeRepayment.body.data.totalLentPaise).toBe(12500);
    expect(beforeRepayment.body.data.outstandingPaise).toBe(12500);

    const repayResponse = await request(app)
      .patch(`/api/loans/${loanId}/repay`)
      .set("Authorization", `Bearer ${token}`);

    expect(repayResponse.status).toBe(200);
    expect(repayResponse.body.data.repaidAt).toBeTruthy();

    const afterRepayment = await request(app)
      .get("/api/loans/summary")
      .set("Authorization", `Bearer ${token}`);

    expect(afterRepayment.body.data.totalRepaidPaise).toBe(12500);
    expect(afterRepayment.body.data.outstandingPaise).toBe(0);
  });

  afterAll(async () => {
    // No separate server listener is started by createApp().
  });
});
