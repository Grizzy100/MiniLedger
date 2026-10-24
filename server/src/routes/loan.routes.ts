
import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  createLoan,
  listLoans,
  repayLoan,
  getLoanSummary,
  getReceipt,
} from "../controllers/loan.controller";
import { receiptUpload } from "../middlewares/upload.middleware";
import {
  createLoanSchema,
  listLoansQuerySchema,
  loanIdSchema,
} from "../validators/loan.validator";

const router = Router();

router.use(authenticate);

router.post("/", receiptUpload, createLoan);

router.get("/summary", getLoanSummary);

router.get("/", validate({ query: listLoansQuerySchema }), listLoans);

router.get("/:id/receipt", validate({ params: loanIdSchema }), getReceipt);

router.patch(
  "/:id/repay",
  validate({ params: loanIdSchema }),
  repayLoan,
);

export default router;
