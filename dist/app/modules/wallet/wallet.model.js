"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Wallet = void 0;
const mongoose_1 = require("mongoose");
const wallet_interface_1 = require("./wallet.interface");
const walletSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
    },
    balance: {
        type: Number,
        required: true,
        default: 5000, // 50 taka = 5000 poisa
        min: [0, "Balance cannot be negative"],
    },
    currency: {
        type: String,
        default: "BDT",
        enum: ["BDT"],
    },
    status: {
        type: String,
        enum: Object.values(wallet_interface_1.WalletStatus),
        default: wallet_interface_1.WalletStatus.ACTIVE,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
    versionKey: false,
});
//indexs performancer er jonno
walletSchema.index({ status: 1 });
walletSchema.index({ isDeleted: 1 });
walletSchema.index({ createdAt: -1 });
exports.Wallet = (0, mongoose_1.model)("Wallet", walletSchema);
