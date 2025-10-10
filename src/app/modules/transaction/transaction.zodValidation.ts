import { z } from "zod";

export const addMoneySchema = z.object({
  body: z.object({
    amount: z
      .number()
      .min(1, "Minimum amount is ৳1")
      .max(100000, "Maximum amount is ৳100,000"),
    description: z.string().min(1, "Description cannot be empty").optional(),
  }),
});

export const withdrawMoneySchema = z.object({
  body: z.object({
    amount: z
      .number()
      .min(1, "Minimum amount is ৳1")
      .max(50000, "Maximum withdrawal is ৳50,000"),
    description: z.string().min(1, "Description cannot be empty").optional(),
  }),
});

export const sendMoneySchema = z.object({
  body: z.object({
    receiverEmail: z
      .string()
      .min(1, "Receiver email is required")
      .email("Invalid email format"),
    amount: z
      .number()
      .min(1, "Minimum amount is ৳1")
      .max(25000, "Maximum send amount is ৳25,000"),
    description: z.string().min(1, "Description cannot be empty").optional(),
  }),
});

export const transactionHistorySchema = z.object({
  query: z.object({
    page: z
      .string()
      .optional()
      .refine((val) => {
        if (!val) return true;
        const num = parseInt(val);
        return !isNaN(num) && num > 0;
      }, "Page must be a positive number"),
    limit: z
      .string()
      .optional()
      .refine((val) => {
        if (!val) return true;
        const num = parseInt(val);
        return !isNaN(num) && num > 0 && num <= 100;
      }, "Limit must be between 1 and 100"),
    type: z
      .string()
      .optional()
      .refine((val) => {
        if (!val) return true;
        return [
          "TOP_UP",
          "WITHDRAW",
          "SEND_MONEY",
          "CASH_IN",
          "CASH_OUT",
        ].includes(val);
      }, "Invalid transaction type"),
    status: z
      .string()
      .optional()
      .refine((val) => {
        if (!val) return true;
        return ["PENDING", "COMPLETED", "FAILED", "REVERSED"].includes(val);
      }, "Invalid transaction status"),
  }),
});

export const transactionDetailsSchema = z.object({
  params: z.object({
    transactionId: z
      .string()
      .min(1, "Transaction ID is required")
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid transaction ID format"),
  }),
});
export const agentCashSchema = z.object({
  body: z.object({
    userEmail: z
      .string()
      .min(1, "User email is required")
      .email("Invalid email format"),
    amount: z
      .number()
      .min(1, "Minimum amount is ৳1")
      .max(50000, "Maximum amount is ৳50,000"),
    description: z
      .string()
      .optional()
  })
});
