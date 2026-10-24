
import {
  createHmac,
  randomInt,
  timingSafeEqual,
} from "node:crypto";
import jwt, { type SignOptions } from "jsonwebtoken";

import { prisma } from "../config/database";
import { env } from "../config/env";
import { AppError } from "../utils/AppError";
import { logger } from "../utils/logger";
import type {
  SendOtpInput,
  VerifyOtpInput,
} from "../validators/auth.validator";

// Hash the OTP so the plain code is never stored in the database.
function hashOtp(phone: string, otp: string): string {
  return createHmac("sha256", env.OTP_SECRET)
    .update(`${phone}:${otp}`)
    .digest("hex");
}

// Compare hashes without an ordinary string comparison.
function isOtpValid(
  phone: string,
  otp: string,
  storedHash: string,
): boolean {
  const submittedHash = Buffer.from(hashOtp(phone, otp), "hex");
  const expectedHash = Buffer.from(storedHash, "hex");

  return (
    submittedHash.length === expectedHash.length &&
    timingSafeEqual(submittedHash, expectedHash)
  );
}

// Generate and store an OTP.
export async function sendOtp(input: SendOtpInput) {
  const { phone } = input;
  const now = new Date();

  const cooldownStart = new Date(
    now.getTime() - env.OTP_RESEND_SECONDS * 1000,
  );

  const recentOtp = await prisma.otp.findFirst({
    where: {
      phone,
      createdAt: { gt: cooldownStart },
    },
    select: { id: true },
  });

  if (recentOtp) {
    throw new AppError(
      "OTP_COOLDOWN",
      429,
      "Please wait before requesting another OTP",
    );
  }

  const otp = randomInt(0, 1_000_000)
    .toString()
    .padStart(6, "0");

  await prisma.$transaction(async (tx) => {
    // Invalidate any previously active OTP for this phone.
    await tx.otp.updateMany({
      where: {
        phone,
        consumedAt: null,
        expiresAt: { gt: now },
      },
      data: { consumedAt: now },
    });

    await tx.otp.create({
      data: {
        phone,
        codeHash: hashOtp(phone, otp),
        expiresAt: new Date(
          now.getTime() + env.OTP_TTL_SECONDS * 1000,
        ),
      },
    });
  });

  // Mock OTP delivery is permitted only outside production.
  if (env.NODE_ENV !== "production") {
    logger.info("Mock OTP generated", { phone, otp });
  }

  return {
    message: "OTP generated successfully",
    expiresIn: env.OTP_TTL_SECONDS,
    ...(env.NODE_ENV !== "production" ? { mockOtp: otp } : {}),
  };
}

// Verify the OTP, consume it once, and issue a JWT.
export async function verifyOtp(input: VerifyOtpInput) {
  const { phone, otp } = input;
  const now = new Date();

  // Find the newest OTP, including consumed or expired records,
  // so we can distinguish an exhausted OTP from a missing one.
  const record = await prisma.otp.findFirst({
    where: { phone },
    orderBy: { createdAt: "desc" },
  });

  if (!record) {
    throw new AppError(
      "INVALID_OTP",
      400,
      "Invalid or expired OTP",
    );
  }

  if (record.attempts >= env.OTP_MAX_ATTEMPTS) {
    throw new AppError(
      "OTP_ATTEMPTS_EXCEEDED",
      429,
      "Maximum OTP attempts exceeded",
    );
  }

  if (record.consumedAt || record.expiresAt <= now) {
    throw new AppError(
      "INVALID_OTP",
      400,
      "Invalid or expired OTP",
    );
  }

  // Incorrect OTP: increment only while the record is usable
  // and the attempt limit has not been reached.
  if (!isOtpValid(phone, otp, record.codeHash)) {
    const updated = await prisma.otp.updateMany({
      where: {
        id: record.id,
        consumedAt: null,
        expiresAt: { gt: new Date() },
        attempts: { lt: env.OTP_MAX_ATTEMPTS },
      },
      data: {
        attempts: { increment: 1 },
      },
    });

    if (updated.count === 0) {
      const latest = await prisma.otp.findUnique({
        where: { id: record.id },
        select: { attempts: true },
      });

      if (
        latest &&
        latest.attempts >= env.OTP_MAX_ATTEMPTS
      ) {
        throw new AppError(
          "OTP_ATTEMPTS_EXCEEDED",
          429,
          "Maximum OTP attempts exceeded",
        );
      }

      throw new AppError(
        "INVALID_OTP",
        400,
        "Invalid or expired OTP",
      );
    }

    throw new AppError(
      "INVALID_OTP",
      400,
      "Invalid or expired OTP",
    );
  }

  // Consume the OTP conditionally. Only one concurrent request
  // can change an active record from unconsumed to consumed.
  const user = await prisma.$transaction(async (tx) => {
    const consumed = await tx.otp.updateMany({
      where: {
        id: record.id,
        codeHash: record.codeHash,
        consumedAt: null,
        expiresAt: { gt: new Date() },
        attempts: { lt: env.OTP_MAX_ATTEMPTS },
      },
      data: {
        consumedAt: new Date(),
      },
    });

    if (consumed.count !== 1) {
      throw new AppError(
        "INVALID_OTP",
        400,
        "Invalid or expired OTP",
      );
    }

    return tx.user.upsert({
      where: { phone },
      update: {},
      create: { phone },
    });
  });

  const token = jwt.sign(
    { sub: user.id },
    env.JWT_SECRET,
    {
      expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
    },
  );

  return {
    message: "Authentication successful",
    token,
    user: {
      id: user.id,
      phone: user.phone,
    },
  };
}
