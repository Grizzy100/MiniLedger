import type { RequestHandler } from "express";
import { prisma } from "../config/database";

export const getHealth: RequestHandler = async (_req, res, next) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({ status: "ok" });
  } catch (error) {
    next(error);
  }
};