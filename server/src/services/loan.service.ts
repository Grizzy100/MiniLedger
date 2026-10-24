
import { prisma } from "../config/database";
import { env } from "../config/env";
import { AppError } from "../utils/AppError";
import {
  fromDateString,
  todayInTz,
} from "../utils/dates";
import type { CreateLoanInput } from "../validators/loan.validator";
import { deleteReceipt, readReceipt, receiptMimeType, storeReceipt, type ReceiptFile } from "../utils/receipt";

function receiptFields(id: string, receiptPath: string | null) {
  return {
    hasReceipt: receiptPath !== null,
    receiptUrl: receiptPath ? `/api/loans/${id}/receipt` : null,
  };
}

export async function createLoan(
  userId: string,
  input: CreateLoanInput,
  receipt?: ReceiptFile,
) {
  const today = todayInTz(env.APP_TIMEZONE);

  if (input.dueDate < today) {
    throw new AppError(
      "INVALID_DUE_DATE",
      400,
      "Due date cannot be in the past",
    );
  }

  const storedReceipt = receipt ? await storeReceipt(receipt) : null;

  try {
    const loan = await prisma.loan.create({
      data: {
        userId,
        friendName: input.friendName,
        amountPaise: input.amountPaise,
        dueDate: fromDateString(input.dueDate),
        note: input.note,
        receiptPath: storedReceipt?.relativePath,
      },
    });

    return {
      id: loan.id,
      friendName: loan.friendName,
      amountPaise: loan.amountPaise,
      dueDate: input.dueDate,
      note: loan.note,
      repaidAt: loan.repaidAt,
      createdAt: loan.createdAt,
      ...receiptFields(loan.id, loan.receiptPath),
    };
  } catch (error) {
    if (storedReceipt) await deleteReceipt(storedReceipt.relativePath);
    throw error;
  }
}

export async function listLoans(
  userId: string,
  page = 1,
) {
  const pageSize = 20;
  const skip = (page - 1) * pageSize;

  const [loans, total] = await prisma.$transaction([
    prisma.loan.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.loan.count({
      where: { userId },
    }),
  ]);

  return {
    data: loans.map((loan) => ({
      id: loan.id,
      friendName: loan.friendName,
      amountPaise: loan.amountPaise,
      dueDate: loan.dueDate.toISOString().slice(0, 10),
      note: loan.note,
      repaidAt: loan.repaidAt,
      createdAt: loan.createdAt,
      ...receiptFields(loan.id, loan.receiptPath),
    })),
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}


export async function repayLoan(userId: string, loanId: string) {
  const result = await prisma.loan.updateMany({
    where: {
      id: loanId,
      userId,
      repaidAt: null,
    },
    data: {
      repaidAt: new Date(),
    },
  });

  if (result.count === 0) {
    const loan = await prisma.loan.findFirst({
      where: { id: loanId, userId },
      select: { repaidAt: true },
    });

    if (!loan) {
      throw new AppError("LOAN_NOT_FOUND", 404, "Loan not found");
    }

    throw new AppError(
      "LOAN_ALREADY_REPAID",
      409,
      "Loan has already been repaid",
    );
  }

  const loan = await prisma.loan.findFirst({
    where: { id: loanId, userId },
  });

  if (!loan) {
    throw new AppError("LOAN_NOT_FOUND", 404, "Loan not found");
  }

  return {
    id: loan.id,
    friendName: loan.friendName,
    amountPaise: loan.amountPaise,
    dueDate: loan.dueDate.toISOString().slice(0, 10),
    note: loan.note,
    repaidAt: loan.repaidAt,
    createdAt: loan.createdAt,
    ...receiptFields(loan.id, loan.receiptPath),
  };
}

export async function getReceipt(userId: string, loanId: string) {
  const loan = await prisma.loan.findFirst({
    where: { id: loanId, userId },
    select: { receiptPath: true },
  });

  if (!loan?.receiptPath) {
    throw new AppError("RECEIPT_NOT_FOUND", 404, "Receipt not found");
  }

  return {
    buffer: await readReceipt(loan.receiptPath),
    mimetype: receiptMimeType(loan.receiptPath),
  };
}



export async function getLoanSummary(userId: string) {
  const loans = await prisma.loan.findMany({
    where: { userId },
    select: {
      amountPaise: true,
      dueDate: true,
      repaidAt: true,
    },
  });

  const today = todayInTz(env.APP_TIMEZONE);

  let totalLentPaise = 0;
  let totalRepaidPaise = 0;
  let outstandingPaise = 0;
  let overduePaise = 0;
  let activeLoans = 0;
  let repaidLoans = 0;

  for (const loan of loans) {
    totalLentPaise += loan.amountPaise;

    if (loan.repaidAt !== null) {
      totalRepaidPaise += loan.amountPaise;
      repaidLoans++;
    } else {
      outstandingPaise += loan.amountPaise;
      activeLoans++;

      const dueDate = loan.dueDate.toISOString().slice(0, 10);

      if (dueDate < today) {
        overduePaise += loan.amountPaise;
      }
    }
  }

  return {
    totalLentPaise,
    totalRepaidPaise,
    outstandingPaise,
    overduePaise,
    activeLoans,
    repaidLoans,
  };
}
