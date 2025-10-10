import { Schema, model } from "mongoose";
import {
  ITransaction,
  TransactionType,
  TransactionStatus,
} from "./transaction.interface";

const transactionSchema = new Schema<ITransaction>(
  {
    fromWallet: {
      type: Schema.Types.ObjectId,
      ref: "Wallet",
      required: function () {
        return this.type !== TransactionType.TOP_UP;
      },
    },
    toWallet: {
      type: Schema.Types.ObjectId,
      ref: "Wallet",
      required: function () {
        return this.type !== TransactionType.WITHDRAW;
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
      enum: Object.values(TransactionType),
      required: [true, "Transaction type is required"],
    },
    status: {
      type: String,
      enum: Object.values(TransactionStatus),
      default: TransactionStatus.PENDING,
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
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    agentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

transactionSchema.index({ fromWallet: 1 });
transactionSchema.index({ toWallet: 1 });
transactionSchema.index({ initiatedBy: 1 });
transactionSchema.index({ type: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ createdAt: -1 });

export const Transaction = model<ITransaction>(
  "Transaction",
  transactionSchema
);
