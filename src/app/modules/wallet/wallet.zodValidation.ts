import { z } from "zod";

export const walletIdParamSchema = z.object({
  walletId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid wallet ID format"),
});

export const updateWalletStatusSchema = z.object({
  status: z.enum(["ACTIVE", "BLOCKED"], {
    message: "Status must be ACTIVE or BLOCKED",
  }),
});
