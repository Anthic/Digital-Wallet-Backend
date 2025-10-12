/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatusCode from "http-status-codes";
import { Request, Response } from "express";
import { catchAsync } from "../../../utils/catchAsync";
import AppError from "../../errorHelper/appError";
import { TransactionService } from "./transaction.service";
import { sendResponse } from "../../../utils/sendResponse";
import { User } from "../users/user.model";

const addMoney = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { amount, description } = req.body;
  if (!userId) {
    throw new AppError("User not authenticated", httpStatusCode.UNAUTHORIZED);
  }

  const amountInPaisa = Math.round(amount * 100);
  if (amountInPaisa < 100) {
    throw new AppError("Minimum amount is ৳1", httpStatusCode.BAD_REQUEST);
  }

  const transaction = await TransactionService.addMoney(
    userId,
    amountInPaisa,
    description
  );
  sendResponse(res, {
    statusCode: httpStatusCode.CREATED,
    success: true,
    message: "Money added successfully",
    data: {
      transactionId: transaction._id,
      reference: transaction.reference,
      amount: Number((transaction.amount / 100).toFixed(2)),
      type: transaction.type,
      status: transaction.status,
      createdAt: transaction.createdAt,
    },
  });
});

const withdrawMoney = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { amount, description } = req.body;
  if (!userId) {
    throw new AppError("User not authenticated", httpStatusCode.UNAUTHORIZED);
  }

  const amountInPaisa = Math.round(amount * 100);

  if (amountInPaisa < 100) {
    throw new AppError("Minimum amount is ৳1", httpStatusCode.BAD_REQUEST);
  }

  const transaction = await TransactionService.withdrawMoney(
    userId,
    amountInPaisa,
    description
  );
  sendResponse(res, {
    statusCode: httpStatusCode.CREATED,
    success: true,
    message: "Money withdrawn successfully",
    data: {
      transactionId: transaction._id,
      reference: transaction.reference,
      amount: Number((transaction.amount / 100).toFixed(2)),
      type: transaction.type,
      status: transaction.status,
      createdAt: transaction.createdAt,
    },
  });
});

const sendMoney = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { receiverEmail, amount, description } = req.body;

  if (!userId) {
    throw new AppError("User not authenticated", httpStatusCode.UNAUTHORIZED);
  }

  if (!receiverEmail || !amount) {
    throw new AppError(
      "Receiver email and amount are required",
      httpStatusCode.BAD_REQUEST
    );
  }

  const amountInPaisa = Math.round(amount * 100);

  if (amountInPaisa < 100) {
    throw new AppError("Minimum amount is ৳1", httpStatusCode.BAD_REQUEST);
  }

  if (amountInPaisa > 2500000) {
    throw new AppError(
      "Maximum send amount is ৳25,000",
      httpStatusCode.BAD_REQUEST
    );
  }

  const currentUser = await User.findById(userId);
  if (currentUser?.email === receiverEmail) {
    throw new AppError(
      "Cannot send money to yourself",
      httpStatusCode.BAD_REQUEST
    );
  }

  const transaction = await TransactionService.sendMoney(
    userId,
    receiverEmail,
    amountInPaisa,
    description
  );

  sendResponse(res, {
    statusCode: httpStatusCode.CREATED,
    success: true,
    message: "Money sent successfully",
    data: {
      transactionId: transaction._id,
      reference: transaction.reference,
      amount: Number((transaction.amount / 100).toFixed(2)),
      receiverEmail,
      type: transaction.type,
      status: transaction.status,
      description: transaction.description,
      createdAt: transaction.createdAt,
    },
  });
});

const getMyTransactions = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const type = req.query.type as string;
  const status = req.query.status as string;

  if (!userId) {
    throw new AppError("User not authenticated", httpStatusCode.UNAUTHORIZED);
  }

  if (page < 1 || limit < 1 || limit > 100) {
    throw new AppError(
      "Invalid pagination parameters",
      httpStatusCode.BAD_REQUEST
    );
  }

  const { transactions, total } =
    await TransactionService.getTransactionHistory(
      userId,
      page,
      limit,
      type,
      status
    );

  const formattedTransactions = transactions.map((transaction) => {
    const isIncoming =
      transaction.toWallet &&
      (transaction.toWallet as any).userId?.toString() === userId.toString();

    return {
      transactionId: transaction._id,
      reference: transaction.reference,
      amount: Number((transaction.amount / 100).toFixed(2)),
      type: transaction.type,
      status: transaction.status,
      description: transaction.description,
      direction: isIncoming ? "INCOMING" : "OUTGOING",
      createdAt: transaction.createdAt,
      metadata: transaction.metadata,
    };
  });

  sendResponse(res, {
    statusCode: httpStatusCode.OK,
    success: true,
    message: "Transaction history retrieved successfully",
    data: {
      transactions: formattedTransactions,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalTransactions: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    },
  });
});

const getAllTransactions = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const type = req.query.type as string;
  const status = req.query.status as string;

  if (page < 1 || limit < 1 || limit > 100) {
    throw new AppError(
      "Invalid pagination parameters",
      httpStatusCode.BAD_REQUEST
    );
  }

  const { transactions, total } = await TransactionService.getAllTransactions(
    page,
    limit,
    type,
    status
  );

  const formattedTransactions = transactions.map((transaction) => ({
    transactionId: transaction._id,
    reference: transaction.reference,
    amount: Number((transaction.amount / 100).toFixed(2)),
    type: transaction.type,
    status: transaction.status,
    description: transaction.description,
    initiatedBy: transaction.initiatedBy,
    fromWallet: transaction.fromWallet,
    toWallet: transaction.toWallet,
    createdAt: transaction.createdAt,
    metadata: transaction.metadata,
  }));

  sendResponse(res, {
    statusCode: httpStatusCode.OK,
    success: true,
    message: "All transactions retrieved successfully",
    data: {
      transactions: formattedTransactions,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalTransactions: total,
      },
    },
  });
});

const getTransactionDetails = catchAsync(
  async (req: Request, res: Response) => {
    const { transactionId } = req.params;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId) {
      throw new AppError("User not authenticated", httpStatusCode.UNAUTHORIZED);
    }

    if (!transactionId) {
      throw new AppError(
        "Transaction ID is required",
        httpStatusCode.BAD_REQUEST
      );
    }

    const transaction = await TransactionService.getTransactionById(
      transactionId,
      userId,
      userRole
    );

    const isIncoming =
      transaction.toWallet &&
      (transaction.toWallet as any).userId?.toString() === userId.toString();

    sendResponse(res, {
      statusCode: httpStatusCode.OK,
      success: true,
      message: "Transaction details retrieved successfully",
      data: {
        transactionId: transaction._id,
        reference: transaction.reference,
        amount: Number((transaction.amount / 100).toFixed(2)),
        fee: transaction.fee ? Number((transaction.fee / 100).toFixed(2)) : 0,
        type: transaction.type,
        status: transaction.status,
        description: transaction.description,
        direction:
          userRole === "ADMIN" ? null : isIncoming ? "INCOMING" : "OUTGOING",
        initiatedBy: transaction.initiatedBy,
        fromWallet: transaction.fromWallet,
        toWallet: transaction.toWallet,
        agentId: transaction.agentId,
        metadata: transaction.metadata,
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt,
      },
    });
  }
);


const agentCashIn = catchAsync(async (req: Request, res: Response) => {
  const agentId = req.user?.userId;
  const { userEmail, amount, description } = req.body;

  if (!agentId) {
    throw new AppError("Agent not authenticated", httpStatusCode.UNAUTHORIZED);
  }

  const amountInPaisa = Math.round(amount * 100);

  if (amountInPaisa < 100) {
    throw new AppError("Minimum amount is ৳1", httpStatusCode.BAD_REQUEST);
  }

  const transaction = await TransactionService.agentCashIn(
    agentId,
    userEmail,
    amountInPaisa,
    description
  );

  sendResponse(res, {
    statusCode: httpStatusCode.CREATED,
    success: true,
    message: "Cash-in completed successfully",
    data: {
      transactionId: transaction._id,
      reference: transaction.reference,
      amount: Number((transaction.amount / 100).toFixed(2)),
      userEmail,
      type: transaction.type,
      status: transaction.status,
      createdAt: transaction.createdAt
    }
  });
});

const agentCashOut = catchAsync(async (req: Request, res: Response) => {
  const agentId = req.user?.userId;
  const { userEmail, amount, description } = req.body;

  if (!agentId) {
    throw new AppError("Agent not authenticated", httpStatusCode.UNAUTHORIZED);
  }

  const amountInPaisa = Math.round(amount * 100);

  if (amountInPaisa < 100) {
    throw new AppError("Minimum amount is ৳1", httpStatusCode.BAD_REQUEST);
  }

  const transaction = await TransactionService.agentCashOut(
    agentId,
    userEmail,
    amountInPaisa,
    description
  );

  sendResponse(res, {
    statusCode: httpStatusCode.CREATED,
    success: true,
    message: "Cash-out completed successfully",
    data: {
      transactionId: transaction._id,
      reference: transaction.reference,
      amount: Number((transaction.amount / 100).toFixed(2)),
      userEmail,
      type: transaction.type,
      status: transaction.status,
      createdAt: transaction.createdAt
    }
  });
});


export const TransactionController = {
  addMoney,
  withdrawMoney,
  sendMoney,
  getMyTransactions,
  getAllTransactions,
  getTransactionDetails,
   agentCashIn,   
  agentCashOut, 
};
