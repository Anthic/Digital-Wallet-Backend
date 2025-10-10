import { model, Schema } from "mongoose";
import { IWallet, WalletStatus } from "./wallet.interface";
const walletSchema = new Schema<IWallet>(
  {
    userId: {
      type: Schema.Types.ObjectId,
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
      enum: Object.values(WalletStatus),
      default: WalletStatus.ACTIVE,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);
//indexs performancer er jonno

walletSchema.index({ status: 1 });
walletSchema.index({ isDeleted: 1 });
walletSchema.index({ createdAt: -1 });

export const Wallet = model<IWallet>("Wallet", walletSchema);
