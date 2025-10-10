import httpStatusCode from "http-status-codes";

import { Request, Response } from "express";
import { catchAsync } from "../../../utils/catchAsync";
import { WalletService } from "./wallet.service";
import { sendResponse } from "../../../utils/sendResponse";
import AppError from "../../errorHelper/appError";

const getMyWallet = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    throw new AppError("User not authenticated", httpStatusCode.UNAUTHORIZED);
  }

  const wallet = await WalletService.getWalletById(userId);

  sendResponse(res, {
    statusCode: httpStatusCode.OK,
    success: true,
    message: "Wallet retrieved successfully",
    data: {
      walletId: wallet._id,
      balance: Number((wallet.balance / 100).toFixed(2)), 
      currency: wallet.currency,
      status: wallet.status,
      createdAt: wallet.createAt 
    }
  });
});

const getAllWallets = catchAsync(async (req: Request, res: Response) => {
  const wallets = await WalletService.getAllWallets();

  sendResponse(res, {
    statusCode: httpStatusCode.OK,
    success: true,
    message: "All wallets retrieved successfully",
    data: wallets.map(wallet => ({
      walletId: wallet._id,
      userId: wallet.userId,
      balance: Number((wallet.balance / 100).toFixed(2)), 
      currency: wallet.currency,
      status: wallet.status,
      user: wallet.userId,
      createdAt: wallet.createAt
    }))
  });
});
const blockWallet = catchAsync(async (req: Request, res: Response) => {
  const { walletId } = req.params;

  const wallet = await WalletService.updateWalletStatus(walletId, "BLOCKED");

  sendResponse(res, {
    statusCode: httpStatusCode.OK,
    success: true,
    message: "Wallet unblocked successfully",
    data: {
      walletId: wallet._id,
      status: wallet.status,
      balance: Number((wallet.balance / 100).toFixed(2)) 
    }
  });
});
const unblockWallet = catchAsync(async (req: Request, res: Response) => {
  const { walletId } = req.params;

  const wallet = await WalletService.updateWalletStatus(walletId, "ACTIVE");

  sendResponse(res, {
    statusCode: httpStatusCode.OK,
    success: true,
    message: "Wallet unblocked successfully",
    data: wallet,
  });
});
export const WalletController = {
  getMyWallet,
  getAllWallets,
  blockWallet,
  unblockWallet,
};
