
import { z } from "zod";

export const createLoanSchema = z.object({
  friendName: z
    .string()
    .trim()
    .min(1, "Friend name is required")
    .max(100, "Friend name cannot exceed 100 characters"),

  // Amount is stored as an integer in paise.
  // ₹100.50 must be sent as 10050.
  amountPaise: z
    .number()
    .int("Amount must be an integer in paise")
    .min(1, "Amount must be greater than zero")
    .max(1_000_000_000, "Amount exceeds the maximum allowed"),

  // Require YYYY-MM-DD, such as 2026-10-25.
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Due date must use YYYY-MM-DD format")
    .refine((value) => {
      const date = new Date(`${value}T00:00:00.000Z`);
      return (
        !Number.isNaN(date.getTime()) &&
        date.toISOString().slice(0, 10) === value
      );
    }, "Due date must be a valid calendar date"),

  note: z
    .string()
    .trim()
    .max(255, "Note cannot exceed 255 characters")
    .optional(),
});

export const loanIdSchema = z.object({
  id: z.string().uuid("Loan ID must be a valid UUID"),
});

export const listLoansQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
});

export type CreateLoanInput = z.infer<typeof createLoanSchema>;
export type ListLoansQuery = z.infer< typeof listLoansQuerySchema>;

export function parseCreateLoanInput(body: Record<string, unknown>) {
  const parsed = createLoanSchema.safeParse({
    ...body,
    amountPaise:
      typeof body.amountPaise === "string"
        ? Number(body.amountPaise)
        : body.amountPaise,
  });

  if (!parsed.success) {
    return { success: false as const, error: parsed.error };
  }

  return { success: true as const, data: parsed.data };
}