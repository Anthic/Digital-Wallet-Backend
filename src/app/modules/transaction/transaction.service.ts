/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatusCode from "http-status-codes";
import mongoose, { Types } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import {
  ITransaction,
  TransactionStatus,
  TransactionType,
} from "./transaction.interface";
import { Wallet } from "../wallet/wallet.model";
import AppError from "../../errorHelper/appError";
import { Transaction } from "./transaction.model";
import { User } from "../users/user.model";

const generateReference = (): string => {
  return `TXN-${uuidv4()}`.toUpperCase();
};

const addMoney = async (
  userId: Types.ObjectId,
  amount: number,
  description?: string
): Promise<ITransaction> => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    const wallet = await Wallet.findOne({ userId, isDeleted: false }).session(
      session
    );
    if (!wallet) {
      throw new AppError("Wallet not found", httpStatusCode.NOT_FOUND);
    }

    if (wallet.status !== "ACTIVE") {
      throw new AppError("Wallet is blocked", httpStatusCode.FORBIDDEN);
    }
    const transactionData = {
      toWallet: wallet._id,
      amount,
      type: TransactionType.TOP_UP,
      status: TransactionStatus.COMPLETED,
      description: description || "Money added to wallet",
      reference: generateReference(),
      initiatedBy: userId,
    };
    const [transaction] = await Transaction.create([transactionData], {
      session,
    });

    await Wallet.findByIdAndUpdate(
      wallet._id,
      { $inc: { balance: amount } },
      { session, new: true }
    );
    await session.commitTransaction();
    // console.log(` Money added: ${amount} paisa to wallet ${wallet._id}`);
    return transaction;
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    // console.error(" Add money failed:", error);
    throw error;
  } finally {
    session.endSession();
  }
};

const withdrawMoney = async (
  userId: Types.ObjectId,
  amount: number,
  description?: string
): Promise<ITransaction> => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const wallet = await Wallet.findOne({
      userId,
      isDeleted: false,
    }).session(session);

    if (!wallet) {
      throw new AppError("Wallet not found", httpStatusCode.NOT_FOUND);
    }

    if (wallet.status !== "ACTIVE") {
      throw new AppError("Wallet is blocked", httpStatusCode.FORBIDDEN);
    }

    if (wallet.balance < amount) {
      throw new AppError("Insufficient balance", httpStatusCode.BAD_REQUEST);
    }
    const transactionData = {
      fromWallet: wallet._id,
      amount,
      type: TransactionType.WITHDRAW,
      status: TransactionStatus.COMPLETED,
      description: description || "Money withdrawn from wallet",
      reference: generateReference(),
      initiatedBy: userId,
    };

    const [transaction] = await Transaction.create([transactionData], {
      session,
    });

    await Wallet.findByIdAndUpdate(
      wallet._id,
      { $inc: { balance: -amount } },
      { session, new: true }
    );
    await session.commitTransaction();
    // console.log(` Money withdrawn: ${amount} paisa from wallet ${wallet._id}`);
    return transaction;
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    // console.error(" Withdraw money failed:", error);
    throw error;
  } finally {
    await session.endSession();
  }
};

const sendMoney = async (
  fromUserId: Types.ObjectId,
  toUserEmail: string,
  amount: number,
  description?: string
): Promise<ITransaction> => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const fromUser = await User.findById(fromUserId).session(session);
    if (!fromUser) {
      throw new AppError("Sender not found", httpStatusCode.NOT_FOUND);
    }

    const fromWallet = await Wallet.findOne({
      userId: fromUserId,
      isDeleted: false,
    }).session(session);

    if (!fromWallet) {
      throw new AppError("Your wallet not found", httpStatusCode.NOT_FOUND);
    }
    if (fromWallet.status !== "ACTIVE") {
      throw new AppError("Your wallet is blocked", httpStatusCode.FORBIDDEN);
    }
    if (fromWallet.balance < amount) {
      throw new AppError(
        `Insufficient balance. Available: ৳${(fromWallet.balance / 100).toFixed(
          2
        )}`,
        httpStatusCode.BAD_REQUEST
      );
    }
    const toUser = await User.findOne({
      email: toUserEmail.toLowerCase().trim(),
      isDeleted: false,
      status: "ACTIVE",
    }).session(session);
    if (!toUser) {
      throw new AppError(
        "Receiver not found or inactive",
        httpStatusCode.NOT_FOUND
      );
    }
    const toWallet = await Wallet.findOne({
      userId: toUser._id,
      isDeleted: false,
    }).session(session);
    if (!toWallet) {
      throw new AppError("Receiver wallet not found", httpStatusCode.NOT_FOUND);
    }

    if (toWallet.status !== "ACTIVE") {
      throw new AppError(
        "Receiver wallet is blocked",
        httpStatusCode.FORBIDDEN
      );
    }

    // nijek jate na pathaite pare (double check)
    if (fromWallet._id.toString() === toWallet._id.toString()) {
      throw new AppError(
        "Cannot send money to yourself",
        httpStatusCode.BAD_REQUEST
      );
    }
    const transactionData = {
      fromWallet: fromWallet._id,
      toWallet: toWallet._id,
      amount,
      type: TransactionType.SEND_MONEY,
      status: TransactionStatus.COMPLETED,
      description:
        description || `Money sent to ${toUser.name} (${toUserEmail})`,
      reference: generateReference(),
      initiatedBy: fromUserId,
      metadata: {
        senderName: fromUser.name,
        receiverName: toUser.name,
        receiverEmail: toUser.email,
      },
    };
    const [transaction] = await Transaction.create([transactionData], {
      session,
    });
    //update sender wallet balance
    await Wallet.findByIdAndUpdate(
      fromWallet._id,
      { $inc: { balance: -amount } },
      { session, new: true }
    );
    //update reciver wallet balance
    await Wallet.findByIdAndUpdate(
      toWallet._id,
      { $inc: { balance: amount } },
      { session, new: true }
    );
    await session.commitTransaction();

    // console.log(
    //   ` Money sent: ${amount} paisa from ${fromWallet._id} to ${toWallet._id}`
    // );
    // console.log(
    //   ` Sender balance: ${fromWallet.balance - amount}, Receiver balance: ${
    //     toWallet.balance + amount
    //   }`
    // );

    return transaction;
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    // console.error(" Send money failed:", error);
    throw error;
  } finally {
    await session.endSession();
  }
};

const getTransactionHistory = async (
  userId: Types.ObjectId,
  page = 1,
  limit= 10,
  type?: string,
  status?: string
): Promise<{ transactions: ITransaction[]; total: number }> => {
  const skip = (page - 1) * limit;

  const wallet = await Wallet.findOne({
    userId,
    isDeleted: false,
  });

  if (!wallet) {
    throw new AppError("Wallet not found", httpStatusCode.NOT_FOUND);
  }

  const query: any = {
    $or: [
      { fromWallet: wallet._id },
      { toWallet: wallet._id },
      { initiatedBy: userId },
    ],
    isDeleted: false,
  };

  if (type) {
    query.type = type;
  }
  if (status) {
    query.status = status;
  }

  const transactions = await Transaction.find(query)
    .populate("fromWallet", "userId balance")
    .populate("toWallet", "userId balance")
    .populate("initiatedBy", "name email")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Transaction.countDocuments(query);

  return { transactions, total };
};

const getAllTransactions = async (
  page= 1,
  limit = 10,
  type?: string,
  status?: string
): Promise<{ transactions: ITransaction[]; total: number }> => {
  const skip = (page - 1) * limit;

  const query: any = { isDeleted: false };

  if (type) {
    query.type = type;
  }
  if (status) {
    query.status = status;
  }

  const transactions = await Transaction.find(query)
    .populate("fromWallet", "userId")
    .populate("toWallet", "userId")
    .populate("initiatedBy", "name email role")
    .populate("agentId", "name email")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Transaction.countDocuments(query);

  return { transactions, total };
};

const getTransactionById = async (
  transactionId: string,
  userId: Types.ObjectId,
  userRole: string
): Promise<ITransaction> => {
  let query: any = {
    _id: transactionId,
    isDeleted: false,
  };

  if (userRole !== "ADMIN") {
    const wallet = await Wallet.findOne({
      userId,
      isDeleted: false,
    });

    if (!wallet) {
      throw new AppError("Wallet not found", httpStatusCode.NOT_FOUND);
    }

    query = {
      ...query,
      $or: [
        { fromWallet: wallet._id },
        { toWallet: wallet._id },
        { initiatedBy: userId },
      ],
    };
  }

  const transaction = await Transaction.findOne(query)
    .populate("fromWallet", "userId")
    .populate("toWallet", "userId")
    .populate("initiatedBy", "name email role")
    .populate("agentId", "name email");

  if (!transaction) {
    throw new AppError("Transaction not found", httpStatusCode.NOT_FOUND);
  }

  return transaction;
};


const agentCashIn = async (
  agentId: Types.ObjectId,
  userEmail: string,
  amount: number,
  description?: string
): Promise<ITransaction> => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();


    const agent = await User.findOne({
      _id: agentId,
      role: "AGENT",
      status: "ACTIVE",
      isDeleted: false,
    }).session(session);

    if (!agent) {
      throw new AppError(
        "Agent not found or inactive",
        httpStatusCode.FORBIDDEN
      );
    }

    const targetUser = await User.findOne({
      email: userEmail.toLowerCase().trim(),
      role: "USER",
      status: "ACTIVE",
      isDeleted: false,
    }).session(session);

    if (!targetUser) {
      throw new AppError("Target user not found", httpStatusCode.NOT_FOUND);
    }

 
    const targetWallet = await Wallet.findOne({
      userId: targetUser._id,
      isDeleted: false,
    }).session(session);

    if (!targetWallet) {
      throw new AppError("Target wallet not found", httpStatusCode.NOT_FOUND);
    }

    if (targetWallet.status !== "ACTIVE") {
      throw new AppError("Target wallet is blocked", httpStatusCode.FORBIDDEN);
    }

   
    const transactionData = {
      toWallet: targetWallet._id,
      amount,
      type: TransactionType.CASH_IN,
      status: TransactionStatus.COMPLETED,
      description: description || `Cash-in by ${agent.name}`,
      reference: generateReference(),
      initiatedBy: agentId,
      agentId: agentId,
      metadata: {
        agentName: agent.name,
        targetUserName: targetUser.name,
        targetUserEmail: targetUser.email,
      },
    };

    const [transaction] = await Transaction.create([transactionData], {
      session,
    });

    
    await Wallet.findByIdAndUpdate(
      targetWallet._id,
      { $inc: { balance: amount } },
      { session, new: true }
    );

    await session.commitTransaction();
    return transaction;
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    throw error;
  } finally {
    await session.endSession();
  }
};

const agentCashOut = async (
  agentId: Types.ObjectId,
  userEmail: string,
  amount: number,
  description?: string
): Promise<ITransaction> => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const agent = await User.findOne({
      _id: agentId,
      role: "AGENT",
      status: "ACTIVE",
      isDeleted: false,
    }).session(session);

    if (!agent) {
      throw new AppError(
        "Agent not found or inactive",
        httpStatusCode.FORBIDDEN
      );
    }

    const targetUser = await User.findOne({
      email: userEmail.toLowerCase().trim(),
      role: "USER",
      status: "ACTIVE",
      isDeleted: false,
    }).session(session);

    if (!targetUser) {
      throw new AppError("Target user not found", httpStatusCode.NOT_FOUND);
    }

    const targetWallet = await Wallet.findOne({
      userId: targetUser._id,
      isDeleted: false,
    }).session(session);

    if (!targetWallet) {
      throw new AppError("Target wallet not found", httpStatusCode.NOT_FOUND);
    }

    if (targetWallet.status !== "ACTIVE") {
      throw new AppError("Target wallet is blocked", httpStatusCode.FORBIDDEN);
    }

    if (targetWallet.balance < amount) {
      throw new AppError(
        `Insufficient balance. Available: ৳${(
          targetWallet.balance / 100
        ).toFixed(2)}`,
        httpStatusCode.BAD_REQUEST
      );
    }

    const transactionData = {
      fromWallet: targetWallet._id,
      amount,
      type: TransactionType.CASH_OUT,
      status: TransactionStatus.COMPLETED,
      description: description || `Cash-out by ${agent.name}`,
      reference: generateReference(),
      initiatedBy: agentId,
      agentId: agentId,
      metadata: {
        agentName: agent.name,
        targetUserName: targetUser.name,
        targetUserEmail: targetUser.email,
      },
    };

    const [transaction] = await Transaction.create([transactionData], {
      session,
    });

    await Wallet.findByIdAndUpdate(
      targetWallet._id,
      { $inc: { balance: -amount } },
      { session, new: true }
    );

    await session.commitTransaction();
    return transaction;
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    throw error;
  } finally {
    await session.endSession();
  }
};

export const TransactionService = {
  addMoney,
  withdrawMoney,
  sendMoney,
  getTransactionById,
  getAllTransactions,
  getTransactionHistory,
  agentCashIn,
  agentCashOut,
};
