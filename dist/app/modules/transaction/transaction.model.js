"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transaction = void 0;
const mongoose_1 = require("mongoose");
const transaction_interface_1 = require("./transaction.interface");
const transactionSchema = new mongoose_1.Schema({
    fromWallet: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Wallet",
        required: function () {
            return this.type !== transaction_interface_1.TransactionType.TOP_UP;
        },
    },
    toWallet: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Wallet",
        required: function () {
            return this.type !== transaction_interface_1.TransactionType.WITHDRAW;
        },
    },
    amount: {
        type: Number,
        required: true,
        min: [1, "Amount must be positive"],
    },
    fee: {
        type: Number,
        default: 0,
        min: [0, "Fee cannot be negative"],
    },
    commission: {
        type: Number,
        default: 0,
        min: [0, "Commission cannot be negative"],
    },
    type: {
        type: String,
        enum: Object.values(transaction_interface_1.TransactionType),
        required: [true, "Transaction type is required"],
    },
    status: {
        type: String,
        enum: Object.values(transaction_interface_1.TransactionStatus),
        default: transaction_interface_1.TransactionStatus.PENDING,
    },
    description: {
        type: String,
        trim: true,
    },
    reference: {
        type: String,
        required: [true, "Reference is required"],
        unique: true,
    },
    initiatedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    agentId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
    },
    metadata: {
        type: mongoose_1.Schema.Types.Mixed,
    },
}, {
    timestamps: true,
    versionKey: false,
});
transactionSchema.index({ fromWallet: 1 });
transactionSchema.index({ toWallet: 1 });
transactionSchema.index({ initiatedBy: 1 });
transactionSchema.index({ type: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ createdAt: -1 });
exports.Transaction = (0, mongoose_1.model)("Transaction", transactionSchema);
