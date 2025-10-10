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
const getWalletById = async (userId: string): Promise<IWallet> => {
  const wallet = await Wallet.findOne({
    userId,
    isDeleted: false,
  }).populate("userId", "name email role");
  if (!wallet) {
    throw new AppError("Wallet not found", httpStatusCode.NOT_FOUND);
  }
  return wallet;
};

const getAllWallets = async (): Promise<IWallet[]> => {
  try {
    const wallet = await Wallet.find({ isDeleted: false })
      .populate("userId", "name email role status")
      .sort({ createdAt: -1 });
    return wallet;
  } catch (error) {
    throw new AppError(
      `Failed to fetch wallets: ${error}`,
      httpStatusCode.BAD_REQUEST
    );
  }
};
const updateWalletStatus = async (
  walletId: string,
  status: string
): Promise<IWallet> => {
  const wallet = await Wallet.findByIdAndUpdate(
    walletId,
    { status },
    { new: true, runValidators: true }
  );

  if (!wallet) {
    throw new AppError("Wallet not found", httpStatusCode.NOT_FOUND);
  }

  return wallet;
};

export const WalletService = {
  createWallet,
  getWalletById,
  getAllWallets,
  updateWalletStatus,
};
