import multer from "multer";
import type { RequestHandler } from "express";
import { AppError } from "../utils/AppError";
import { env } from "../config/env";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.MAX_RECEIPT_BYTES, files: 1 },
});

export const receiptUpload: RequestHandler = (req, res, next) => {
  upload.single("receipt")(req, res, (error: unknown) => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        next(new AppError("RECEIPT_TOO_LARGE", 413, "Receipt must be 5 MB or smaller"));
        return;
      }
      next(new AppError("INVALID_RECEIPT_UPLOAD", 400, error.message));
      return;
    }

    next(error);
  });
};
