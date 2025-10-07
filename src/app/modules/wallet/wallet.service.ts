import httpStatusCode from "http-status-codes";
import { Types } from "mongoose";
import { IWallet, WalletStatus } from "./wallet.interface";
import { Wallet } from "./wallet.model";
import AppError from "../../errorHelper/appError";

const createWallet = async (userId: Types.ObjectId): Promise<IWallet> => {
  const existWallet = await Wallet.findOne({ userId, isDeleted: false });
  if (existWallet) {
    throw new AppError("User already has wallet", httpStatusCode.BAD_REQUEST);
  }

  const wallet = await Wallet.create({
    userId,
    balance: 5000, // 50 taka inital balance
    currency: "BDT",
    status: WalletStatus.ACTIVE,
  });
  return wallet;
};



export const WalletService = {
    createWallet
}
