import authRoutes from "./routes/auth.routes";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { env } from "./config/env";

import healthRoutes from "./routes/health.routes";
import protectedRoutes from "./routes/protected.routes";
import loanRoutes from "./routes/loan.routes";

import {
  errorHandler,
  notFoundHandler,
} from "./middlewares/error.middleware";

// Allow 20 OTP requests per minute per IP address.
// This is a first line of defence — the OTP service also enforces a
// 30-second per-phone cooldown at the database level.
const authLimiter = rateLimit({
  windowMs: 60 * 1000,   // 1 minute
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { message: "Too many requests. Please wait a minute." } },
});

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN }));
  app.use(express.json({ limit: "10kb" }));

  app.use("/health", healthRoutes);
  app.use("/api/auth", authLimiter, authRoutes);
  app.use("/api", protectedRoutes);
  app.use("/api/loans", loanRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}


