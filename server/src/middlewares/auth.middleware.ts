
import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";

import { env } from "../config/env";
import { AppError } from "../utils/AppError";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export const authenticate: RequestHandler = (req, _res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return next(
      new AppError(
        "UNAUTHORIZED",
        401,
        "Authentication token is required",
      ),
    );
  }

  const token = authorization.slice("Bearer ".length).trim();

  if (!token) {
    return next(
      new AppError(
        "UNAUTHORIZED",
        401,
        "Authentication token is required",
      ),
    );
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET);

    if (
      typeof payload === "string" ||
      typeof payload.sub !== "string" ||
      payload.sub.length === 0
    ) {
      return next(
        new AppError(
          "UNAUTHORIZED",
          401,
          "Invalid authentication token",
        ),
      );
    }

    req.userId = payload.sub;
    next();
  } catch {
    next(
      new AppError(
        "UNAUTHORIZED",
        401,
        "Invalid or expired authentication token",
      ),
    );
  }
};
