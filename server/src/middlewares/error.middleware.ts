
import type {
  ErrorRequestHandler,
  RequestHandler,
} from "express";

import { AppError } from "../utils/AppError";
import { logger } from "../utils/logger";

// Handles requests to routes that do not exist.
export const notFoundHandler: RequestHandler = (
  req,
  _res,
  next,
) => {
  next(
    new AppError(
      "NOT_FOUND",
      404,
      `Route ${req.method} ${req.originalUrl} not found`,
    ),
  );
};

// Handles all errors passed to Express.
export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  _req,
  res,
  _next,
) => {
  if (res.headersSent) {
    return;
  }

  if (error instanceof AppError) {
    res.status(error.httpStatus).json({
      error: {
        code: error.code,
        message: error.message,
        ...(error.details ? { details: error.details } : {}),
      },
    });
    return;
  }

  logger.error("Unhandled request error", {
    error: error instanceof Error ? error.stack : String(error),
  });

  res.status(500).json({
    error: {
      code: "INTERNAL",
      message: "Internal server error",
    },
  });
};
