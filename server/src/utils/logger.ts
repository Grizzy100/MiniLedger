// utils/logger.ts
//
// Winston is the logger for MiniLedger.
// In development, output is colorized and human-readable.
// In production, output is newline-delimited JSON — easy to pipe into
// a log aggregator (Loki, Datadog, CloudWatch, etc.).
//
// Security rule: never log JWTs, OTP hashes, or Authorization headers.
// The mock-OTP line in auth.service.ts is the only deliberate exception.

import winston from "winston";
import { env } from "../config/env";

// ── Formats ──────────────────────────────────────────────────────────────────

// Development: "[HH:mm:ss.SSS] info: message"  with colour
const devFormat = winston.format.combine(
  winston.format.timestamp({ format: "HH:mm:ss.SSS" }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => {
    const { timestamp, level, message, ...metadata } = info;
    const extra = Object.keys(metadata).length
      ? ` ${JSON.stringify(metadata)}`
      : "";

    return `[${timestamp}] ${level}: ${message}${extra}`;
  }),
);

// Production: {"level":"info","message":"...","timestamp":"..."}
const prodFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json()
);

// ── Logger instance ───────────────────────────────────────────────────────────

export const logger = winston.createLogger({
  level: "info",
  format: env.NODE_ENV === "development" ? devFormat : prodFormat,
  transports: [
    // All log levels go to stdout; the process supervisor decides where to write them.
    new winston.transports.Console(),
  ],
});
