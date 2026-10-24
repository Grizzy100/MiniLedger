
import { Router } from "express";
import { sendOtp, verifyOtp } from "../controllers/auth.controller";
import { validate } from "../middlewares/validate.middleware";
import {
  sendOtpSchema,
  verifyOtpSchema,
} from "../validators/auth.validator";

const router = Router();

router.post(
  "/send-otp",
  validate({ body: sendOtpSchema }),
  sendOtp,
);

router.post(
  "/verify-otp",
  validate({ body: verifyOtpSchema }),
  verifyOtp,
);

export default router;
