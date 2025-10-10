"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.agentCashSchema = exports.transactionDetailsSchema = exports.transactionHistorySchema = exports.sendMoneySchema = exports.withdrawMoneySchema = exports.addMoneySchema = void 0;
const zod_1 = require("zod");
exports.addMoneySchema = zod_1.z.object({
    body: zod_1.z.object({
        amount: zod_1.z
            .number()
            .min(1, "Minimum amount is ৳1")
            .max(100000, "Maximum amount is ৳100,000"),
        description: zod_1.z.string().min(1, "Description cannot be empty").optional(),
    }),
});
exports.withdrawMoneySchema = zod_1.z.object({
    body: zod_1.z.object({
        amount: zod_1.z
            .number()
            .min(1, "Minimum amount is ৳1")
            .max(50000, "Maximum withdrawal is ৳50,000"),
        description: zod_1.z.string().min(1, "Description cannot be empty").optional(),
    }),
});
exports.sendMoneySchema = zod_1.z.object({
    body: zod_1.z.object({
        receiverEmail: zod_1.z
            .string()
            .min(1, "Receiver email is required")
            .email("Invalid email format"),
        amount: zod_1.z
            .number()
            .min(1, "Minimum amount is ৳1")
            .max(25000, "Maximum send amount is ৳25,000"),
        description: zod_1.z.string().min(1, "Description cannot be empty").optional(),
    }),
});
exports.transactionHistorySchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z
            .string()
            .optional()
            .refine((val) => {
            if (!val)
                return true;
            const num = parseInt(val);
            return !isNaN(num) && num > 0;
        }, "Page must be a positive number"),
        limit: zod_1.z
            .string()
            .optional()
            .refine((val) => {
            if (!val)
                return true;
            const num = parseInt(val);
            return !isNaN(num) && num > 0 && num <= 100;
        }, "Limit must be between 1 and 100"),
        type: zod_1.z
            .string()
            .optional()
            .refine((val) => {
            if (!val)
                return true;
            return [
                "TOP_UP",
                "WITHDRAW",
                "SEND_MONEY",
                "CASH_IN",
                "CASH_OUT",
            ].includes(val);
        }, "Invalid transaction type"),
        status: zod_1.z
            .string()
            .optional()
            .refine((val) => {
            if (!val)
                return true;
            return ["PENDING", "COMPLETED", "FAILED", "REVERSED"].includes(val);
        }, "Invalid transaction status"),
    }),
});
exports.transactionDetailsSchema = zod_1.z.object({
    params: zod_1.z.object({
        transactionId: zod_1.z
            .string()
            .min(1, "Transaction ID is required")
            .regex(/^[0-9a-fA-F]{24}$/, "Invalid transaction ID format"),
    }),
});
exports.agentCashSchema = zod_1.z.object({
    body: zod_1.z.object({
        userEmail: zod_1.z
            .string()
            .min(1, "User email is required")
            .email("Invalid email format"),
        amount: zod_1.z
            .number()
            .min(1, "Minimum amount is ৳1")
            .max(50000, "Maximum amount is ৳50,000"),
        description: zod_1.z
            .string()
            .optional()
    })
});
