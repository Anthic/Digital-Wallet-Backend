import httpStatusCode from "http-status-codes";
import { Request, Response } from "express";
import { catchAsync } from "../../../utils/catchAsync";
import { sendResponse } from "../../../utils/sendResponse";

import { Wallet } from "../wallet/wallet.model";
import AppError from "../../errorHelper/appError";
import { User } from "../users/user.model";


const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const role = req.query.role as string;
  const skip = (page - 1) * limit;

  const query: any = { isDeleted: false };
  if (role) {
    query.role = role.toUpperCase();
  }

  const users = await User.find(query)
    .select("-password")
    .populate("walletId", "balance status")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await User.countDocuments(query);

  sendResponse(res, {
    statusCode: httpStatusCode.OK,
    success: true,
    message: "Users retrieved successfully",
    data: {
      users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalUsers: total,
      },
    },
  });
});


const getAllWallets = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const status = req.query.status as string;
  const skip = (page - 1) * limit;

  const query: any = { isDeleted: false };
  if (status) {
    query.status = status.toUpperCase();
  }

  const wallets = await Wallet.find(query)
    .populate("userId", "name email role")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Wallet.countDocuments(query);


  const formattedWallets = wallets.map((wallet) => ({
    walletId: wallet._id,
    balance: Number((wallet.balance / 100).toFixed(2)),
    status: wallet.status,
    currency: wallet.currency,
    user: wallet.userId,
    createdAt: wallet.createAt,
    updatedAt: wallet.updateAt,
  }));

  sendResponse(res, {
    statusCode: httpStatusCode.OK,
    success: true,
    message: "Wallets retrieved successfully",
    data: {
      wallets: formattedWallets,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalWallets: total,
      },
    },
  });
});

const toggleWalletStatus = catchAsync(async (req: Request, res: Response) => {
  const { walletId } = req.params;
  const { status } = req.body;

  if (!["ACTIVE", "BLOCKED"].includes(status)) {
    throw new AppError(
      "Invalid status. Use ACTIVE or BLOCKED",
      httpStatusCode.BAD_REQUEST
    );
  }

  const wallet = await Wallet.findByIdAndUpdate(
    walletId,
    { status },
    { new: true }
  ).populate("userId", "name email role");

  if (!wallet) {
    throw new AppError("Wallet not found", httpStatusCode.NOT_FOUND);
  }

  sendResponse(res, {
    statusCode: httpStatusCode.OK,
    success: true,
    message: `Wallet ${status.toLowerCase()} successfully`,
    data: {
      walletId: wallet._id,
      status: wallet.status,
      balance: Number((wallet.balance / 100).toFixed(2)),
      user: wallet.userId,
    },
  });
});


const toggleAgentStatus = catchAsync(async (req: Request, res: Response) => {
  const { agentId } = req.params;
  const { status } = req.body;

  if (!["ACTIVE", "SUSPENDED"].includes(status)) {
    throw new AppError(
      "Invalid status. Use ACTIVE or SUSPENDED",
      httpStatusCode.BAD_REQUEST
    );
  }

  const agent = await User.findOneAndUpdate(
    { _id: agentId, role: "AGENT" },
    { status },
    { new: true }
  ).select("-password");

  if (!agent) {
    throw new AppError("Agent not found", httpStatusCode.NOT_FOUND);
  }

  sendResponse(res, {
    statusCode: httpStatusCode.OK,
    success: true,
    message: `Agent ${status.toLowerCase()} successfully`,
    data: agent,
  });
});

export const AdminController = {
  getAllUsers,
  getAllWallets,
  toggleWalletStatus,
  toggleAgentStatus,
};
