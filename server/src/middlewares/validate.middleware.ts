
import type { Request, RequestHandler } from "express";
import type { ZodType } from "zod";
import { AppError } from "../utils/AppError";

type RequestSchemas = {
  body?: ZodType;
  params?: ZodType;
  query?: ZodType;
};

declare global {
  namespace Express {
    interface Request {
      validated?: {
        body?: unknown;
        params?: unknown;
        query?: unknown;
      };
    }
  }
}

export function validate(schemas: RequestSchemas): RequestHandler {
  return (req, _res, next) => {
    const errors: { field: string; message: string }[] = [];
    const validated: NonNullable<Request["validated"]> = {};

    for (const key of ["body", "params", "query"] as const) {
      const schema = schemas[key];

      if (!schema) {
        continue;
      }

      const result = schema.safeParse(req[key]);

      if (!result.success) {
        for (const issue of result.error.issues) {
          errors.push({
            field: `${key}.${issue.path.join(".")}`,
            message: issue.message,
          });
        }
        continue;
      }

      if (key === "body") {
        validated.body = result.data;
      } else if (key === "params") {
        validated.params = result.data;
      } else {
        validated.query = result.data;
      }
    }

    if (errors.length > 0) {
      return next(
        new AppError(
          "VALIDATION_ERROR",
          400,
          "Invalid request data",
          errors,
        ),
      );
    }

    req.validated = validated;
    next();
  };
}


// Understand the flow
// 1. A route provides its Zod schemas.
// 2. The middleware validates the body, params, and query that have schemas.
// 3. Invalid data produces a 400 VALIDATION_ERROR response.
// 4. Valid data continues to the next middleware or controller.