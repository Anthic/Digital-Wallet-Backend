import httpStatusCode from "http-status-codes";
import { Request, Response } from "express";
import { catchAsync } from "../../../utils/catchAsync";
import { sendResponse } from "../../../utils/sendResponse";
import { Wallet } from "../wallet/wallet.model";
import AppError from "../../errorHelper/appError";
import { User } from "../users/user.model";

// Type definitions for query filters
interface UserQueryFilter {
  isDeleted: boolean;
  role?: string;
}

interface WalletQueryFilter {
  isDeleted: boolean;
  status?: string;
}

// Type definitions for request query parameters
interface PaginationQuery {
  page?: string;
  limit?: string;
  role?: string;
  status?: string;
}

// Type definitions for request body
interface WalletStatusBody {
  status: "ACTIVE" | "BLOCKED";
}

interface AgentStatusBody {
  status: "ACTIVE" | "SUSPENDED";
}

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const query = req.query as PaginationQuery;
  const page = parseInt(query.page || "1") || 1;
  const limit = parseInt(query.limit || "10") || 10;
  const role = query.role;
  const skip = (page - 1) * limit;

  const userQuery: UserQueryFilter = { isDeleted: false };
  if (role) {
    userQuery.role = role.toUpperCase();
  }

  const users = await User.find(userQuery)
    .select("-password")
    .populate("walletId", "balance status")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await User.countDocuments(userQuery);

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
  const query = req.query as PaginationQuery;
  const page = parseInt(query.page || "1") || 1;
  const limit = parseInt(query.limit || "10") || 10;
  const status = query.status;
  const skip = (page - 1) * limit;

  const walletQuery: WalletQueryFilter = { isDeleted: false };
  if (status) {
    walletQuery.status = status.toUpperCase();
  }

  const wallets = await Wallet.find(walletQuery)
    .populate("userId", "name email role")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Wallet.countDocuments(walletQuery);

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
  const { status } = req.body as WalletStatusBody;

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
  const { status } = req.body as AgentStatusBody;

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