
import type { RequestHandler } from "express";

import {
  createLoan as createLoanService,
  listLoans as listLoansService,
  repayLoan as repayLoanService,
  getLoanSummary as getLoanSummaryService,
  getReceipt as getReceiptService,
} from "../services/loan.service";
import { parseCreateLoanInput } from "../validators/loan.validator";

import type {
  CreateLoanInput,
  ListLoansQuery,
} from "../validators/loan.validator";

export const createLoan: RequestHandler = async (req, res, next) => {
  try {
    const parsed = parseCreateLoanInput(req.body as Record<string, unknown>);
    if (!parsed.success) {
      res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Request validation failed",
          details: parsed.error.flatten(),
        },
      });
      return;
    }

    const receipt = req.file
      ? { buffer: req.file.buffer, mimetype: req.file.mimetype }
      : undefined;
    const loan = await createLoanService(req.userId!, parsed.data, receipt);

    res.status(201).json({ data: loan });
  } catch (error) {
    next(error);
  }
};

export const getReceipt: RequestHandler = async (req, res, next) => {
  try {
    const params = req.validated?.params as { id: string };

    const result = await getReceiptService(req.userId!, params.id);

    res.type(result.mimetype).send(result.buffer);
  } catch (error) {
    next(error);
  }
};

export const listLoans: RequestHandler = async (req, res, next) => {
  try {
    const query = req.validated?.query as ListLoansQuery;
    const result = await listLoansService(req.userId!, query.page);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};


export const repayLoan: RequestHandler = async (req, res, next) => {
  try {
    const params = req.validated?.params as { id: string };

    const loan = await repayLoanService(req.userId!, params.id);

    res.status(200).json({ data: loan });
  } catch (error) {
    next(error);
  }
};


export const getLoanSummary: RequestHandler = async (req, res, next) => {
  try {
    const summary = await getLoanSummaryService(req.userId!);

    res.status(200).json({ data: summary });
  } catch (error) {
    next(error);
  }
};