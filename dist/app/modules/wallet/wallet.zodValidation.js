"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateWalletStatusSchema = exports.walletIdParamSchema = void 0;
const zod_1 = require("zod");
exports.walletIdParamSchema = zod_1.z.object({
    walletId: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid wallet ID format"),
});
exports.updateWalletStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(["ACTIVE", "BLOCKED"], {
        message: "Status must be ACTIVE or BLOCKED",
    }),
});
