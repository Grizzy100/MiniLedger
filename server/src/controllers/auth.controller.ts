
import type { RequestHandler } from "express";
import {
  sendOtp as sendOtpService,
  verifyOtp as verifyOtpService,
} from "../services/auth.service";
import type {
  SendOtpInput,
  VerifyOtpInput,
} from "../validators/auth.validator";

export const sendOtp: RequestHandler = async (req, res, next) => {
  try {
    const input = req.validated?.body as SendOtpInput;
    const result = await sendOtpService(input);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const verifyOtp: RequestHandler = async (req, res, next) => {
  try {
    const input = req.validated?.body as VerifyOtpInput;
    const result = await verifyOtpService(input);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
