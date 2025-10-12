"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionService = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const mongoose_1 = __importDefault(require("mongoose"));
const uuid_1 = require("uuid");
const transaction_interface_1 = require("./transaction.interface");
const wallet_model_1 = require("../wallet/wallet.model");
const appError_1 = __importDefault(require("../../errorHelper/appError"));
const transaction_model_1 = require("./transaction.model");
const user_model_1 = require("../users/user.model");
const generateReference = () => {
    return `TXN-${(0, uuid_1.v4)()}`.toUpperCase();
};
const addMoney = (userId, amount, description) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    try {
        session.startTransaction();
        const wallet = yield wallet_model_1.Wallet.findOne({ userId, isDeleted: false }).session(session);
        if (!wallet) {
            throw new appError_1.default("Wallet not found", http_status_codes_1.default.NOT_FOUND);
        }
        if (wallet.status !== "ACTIVE") {
            throw new appError_1.default("Wallet is blocked", http_status_codes_1.default.FORBIDDEN);
        }
        const transactionData = {
            toWallet: wallet._id,
            amount,
            type: transaction_interface_1.TransactionType.TOP_UP,
            status: transaction_interface_1.TransactionStatus.COMPLETED,
            description: description || "Money added to wallet",
            reference: generateReference(),
            initiatedBy: userId,
        };
        const [transaction] = yield transaction_model_1.Transaction.create([transactionData], {
            session,
        });
        yield wallet_model_1.Wallet.findByIdAndUpdate(wallet._id, { $inc: { balance: amount } }, { session, new: true });
        yield session.commitTransaction();
        // console.log(` Money added: ${amount} paisa to wallet ${wallet._id}`);
        return transaction;
    }
    catch (error) {
        if (session.inTransaction()) {
            yield session.abortTransaction();
        }
        // console.error(" Add money failed:", error);
        throw error;
    }
    finally {
        session.endSession();
    }
});
const withdrawMoney = (userId, amount, description) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    try {
        session.startTransaction();
        const wallet = yield wallet_model_1.Wallet.findOne({
            userId,
            isDeleted: false,
        }).session(session);
        if (!wallet) {
            throw new appError_1.default("Wallet not found", http_status_codes_1.default.NOT_FOUND);
        }
        if (wallet.status !== "ACTIVE") {
            throw new appError_1.default("Wallet is blocked", http_status_codes_1.default.FORBIDDEN);
        }
        if (wallet.balance < amount) {
            throw new appError_1.default("Insufficient balance", http_status_codes_1.default.BAD_REQUEST);
        }
        const transactionData = {
            fromWallet: wallet._id,
            amount,
            type: transaction_interface_1.TransactionType.WITHDRAW,
            status: transaction_interface_1.TransactionStatus.COMPLETED,
            description: description || "Money withdrawn from wallet",
            reference: generateReference(),
            initiatedBy: userId,
        };
        const [transaction] = yield transaction_model_1.Transaction.create([transactionData], {
            session,
        });
        yield wallet_model_1.Wallet.findByIdAndUpdate(wallet._id, { $inc: { balance: -amount } }, { session, new: true });
        yield session.commitTransaction();
        // console.log(` Money withdrawn: ${amount} paisa from wallet ${wallet._id}`);
        return transaction;
    }
    catch (error) {
        if (session.inTransaction()) {
            yield session.abortTransaction();
        }
        // console.error(" Withdraw money failed:", error);
        throw error;
    }
    finally {
        yield session.endSession();
    }
});
const sendMoney = (fromUserId, toUserEmail, amount, description) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    try {
        session.startTransaction();
        const fromUser = yield user_model_1.User.findById(fromUserId).session(session);
        if (!fromUser) {
            throw new appError_1.default("Sender not found", http_status_codes_1.default.NOT_FOUND);
        }
        const fromWallet = yield wallet_model_1.Wallet.findOne({
            userId: fromUserId,
            isDeleted: false,
        }).session(session);
        if (!fromWallet) {
            throw new appError_1.default("Your wallet not found", http_status_codes_1.default.NOT_FOUND);
        }
        if (fromWallet.status !== "ACTIVE") {
            throw new appError_1.default("Your wallet is blocked", http_status_codes_1.default.FORBIDDEN);
        }
        if (fromWallet.balance < amount) {
            throw new appError_1.default(`Insufficient balance. Available: ৳${(fromWallet.balance / 100).toFixed(2)}`, http_status_codes_1.default.BAD_REQUEST);
        }
        const toUser = yield user_model_1.User.findOne({
            email: toUserEmail.toLowerCase().trim(),
            isDeleted: false,
            status: "ACTIVE",
        }).session(session);
        if (!toUser) {
            throw new appError_1.default("Receiver not found or inactive", http_status_codes_1.default.NOT_FOUND);
        }
        const toWallet = yield wallet_model_1.Wallet.findOne({
            userId: toUser._id,
            isDeleted: false,
        }).session(session);
        if (!toWallet) {
            throw new appError_1.default("Receiver wallet not found", http_status_codes_1.default.NOT_FOUND);
        }
        if (toWallet.status !== "ACTIVE") {
            throw new appError_1.default("Receiver wallet is blocked", http_status_codes_1.default.FORBIDDEN);
        }
        // nijek jate na pathaite pare (double check)
        if (fromWallet._id.toString() === toWallet._id.toString()) {
            throw new appError_1.default("Cannot send money to yourself", http_status_codes_1.default.BAD_REQUEST);
        }
        const transactionData = {
            fromWallet: fromWallet._id,
            toWallet: toWallet._id,
            amount,
            type: transaction_interface_1.TransactionType.SEND_MONEY,
            status: transaction_interface_1.TransactionStatus.COMPLETED,
            description: description || `Money sent to ${toUser.name} (${toUserEmail})`,
            reference: generateReference(),
            initiatedBy: fromUserId,
            metadata: {
                senderName: fromUser.name,
                receiverName: toUser.name,
                receiverEmail: toUser.email,
            },
        };
        const [transaction] = yield transaction_model_1.Transaction.create([transactionData], {
            session,
        });
        //update sender wallet balance
        yield wallet_model_1.Wallet.findByIdAndUpdate(fromWallet._id, { $inc: { balance: -amount } }, { session, new: true });
        //update reciver wallet balance
        yield wallet_model_1.Wallet.findByIdAndUpdate(toWallet._id, { $inc: { balance: amount } }, { session, new: true });
        yield session.commitTransaction();
        // console.log(
        //   ` Money sent: ${amount} paisa from ${fromWallet._id} to ${toWallet._id}`
        // );
        // console.log(
        //   ` Sender balance: ${fromWallet.balance - amount}, Receiver balance: ${
        //     toWallet.balance + amount
        //   }`
        // );
        return transaction;
    }
    catch (error) {
        if (session.inTransaction()) {
            yield session.abortTransaction();
        }
        // console.error(" Send money failed:", error);
        throw error;
    }
    finally {
        yield session.endSession();
    }
});
const getTransactionHistory = (userId_1, ...args_1) => __awaiter(void 0, [userId_1, ...args_1], void 0, function* (userId, page = 1, limit = 10, type, status) {
    const skip = (page - 1) * limit;
    const wallet = yield wallet_model_1.Wallet.findOne({
        userId,
        isDeleted: false,
    });
    if (!wallet) {
        throw new appError_1.default("Wallet not found", http_status_codes_1.default.NOT_FOUND);
    }
    const query = {
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
    const transactions = yield transaction_model_1.Transaction.find(query)
        .populate("fromWallet", "userId balance")
        .populate("toWallet", "userId balance")
        .populate("initiatedBy", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    const total = yield transaction_model_1.Transaction.countDocuments(query);
    return { transactions, total };
});
const getAllTransactions = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (page = 1, limit = 10, type, status) {
    const skip = (page - 1) * limit;
    const query = { isDeleted: false };
    if (type) {
        query.type = type;
    }
    if (status) {
        query.status = status;
    }
    const transactions = yield transaction_model_1.Transaction.find(query)
        .populate("fromWallet", "userId")
        .populate("toWallet", "userId")
        .populate("initiatedBy", "name email role")
        .populate("agentId", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    const total = yield transaction_model_1.Transaction.countDocuments(query);
    return { transactions, total };
});
const getTransactionById = (transactionId, userId, userRole) => __awaiter(void 0, void 0, void 0, function* () {
    let query = {
        _id: transactionId,
        isDeleted: false,
    };
    if (userRole !== "ADMIN") {
        const wallet = yield wallet_model_1.Wallet.findOne({
            userId,
            isDeleted: false,
        });
        if (!wallet) {
            throw new appError_1.default("Wallet not found", http_status_codes_1.default.NOT_FOUND);
        }
        query = Object.assign(Object.assign({}, query), { $or: [
                { fromWallet: wallet._id },
                { toWallet: wallet._id },
                { initiatedBy: userId },
            ] });
    }
    const transaction = yield transaction_model_1.Transaction.findOne(query)
        .populate("fromWallet", "userId")
        .populate("toWallet", "userId")
        .populate("initiatedBy", "name email role")
        .populate("agentId", "name email");
    if (!transaction) {
        throw new appError_1.default("Transaction not found", http_status_codes_1.default.NOT_FOUND);
    }
    return transaction;
});
const agentCashIn = (agentId, userEmail, amount, description) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    try {
        session.startTransaction();
        const agent = yield user_model_1.User.findOne({
            _id: agentId,
            role: "AGENT",
            status: "ACTIVE",
            isDeleted: false,
        }).session(session);
        if (!agent) {
            throw new appError_1.default("Agent not found or inactive", http_status_codes_1.default.FORBIDDEN);
        }
        const targetUser = yield user_model_1.User.findOne({
            email: userEmail.toLowerCase().trim(),
            role: "USER",
            status: "ACTIVE",
            isDeleted: false,
        }).session(session);
        if (!targetUser) {
            throw new appError_1.default("Target user not found", http_status_codes_1.default.NOT_FOUND);
        }
        const targetWallet = yield wallet_model_1.Wallet.findOne({
            userId: targetUser._id,
            isDeleted: false,
        }).session(session);
        if (!targetWallet) {
            throw new appError_1.default("Target wallet not found", http_status_codes_1.default.NOT_FOUND);
        }
        if (targetWallet.status !== "ACTIVE") {
            throw new appError_1.default("Target wallet is blocked", http_status_codes_1.default.FORBIDDEN);
        }
        const transactionData = {
            toWallet: targetWallet._id,
            amount,
            type: transaction_interface_1.TransactionType.CASH_IN,
            status: transaction_interface_1.TransactionStatus.COMPLETED,
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
        const [transaction] = yield transaction_model_1.Transaction.create([transactionData], {
            session,
        });
        yield wallet_model_1.Wallet.findByIdAndUpdate(targetWallet._id, { $inc: { balance: amount } }, { session, new: true });
        yield session.commitTransaction();
        return transaction;
    }
    catch (error) {
        if (session.inTransaction()) {
            yield session.abortTransaction();
        }
        throw error;
    }
    finally {
        yield session.endSession();
    }
});
const agentCashOut = (agentId, userEmail, amount, description) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    try {
        session.startTransaction();
        const agent = yield user_model_1.User.findOne({
            _id: agentId,
            role: "AGENT",
            status: "ACTIVE",
            isDeleted: false,
        }).session(session);
        if (!agent) {
            throw new appError_1.default("Agent not found or inactive", http_status_codes_1.default.FORBIDDEN);
        }
        const targetUser = yield user_model_1.User.findOne({
            email: userEmail.toLowerCase().trim(),
            role: "USER",
            status: "ACTIVE",
            isDeleted: false,
        }).session(session);
        if (!targetUser) {
            throw new appError_1.default("Target user not found", http_status_codes_1.default.NOT_FOUND);
        }
        const targetWallet = yield wallet_model_1.Wallet.findOne({
            userId: targetUser._id,
            isDeleted: false,
        }).session(session);
        if (!targetWallet) {
            throw new appError_1.default("Target wallet not found", http_status_codes_1.default.NOT_FOUND);
        }
        if (targetWallet.status !== "ACTIVE") {
            throw new appError_1.default("Target wallet is blocked", http_status_codes_1.default.FORBIDDEN);
        }
        if (targetWallet.balance < amount) {
            throw new appError_1.default(`Insufficient balance. Available: ৳${(targetWallet.balance / 100).toFixed(2)}`, http_status_codes_1.default.BAD_REQUEST);
        }
        const transactionData = {
            fromWallet: targetWallet._id,
            amount,
            type: transaction_interface_1.TransactionType.CASH_OUT,
            status: transaction_interface_1.TransactionStatus.COMPLETED,
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
        const [transaction] = yield transaction_model_1.Transaction.create([transactionData], {
            session,
        });
        yield wallet_model_1.Wallet.findByIdAndUpdate(targetWallet._id, { $inc: { balance: -amount } }, { session, new: true });
        yield session.commitTransaction();
        return transaction;
    }
    catch (error) {
        if (session.inTransaction()) {
            yield session.abortTransaction();
        }
        throw error;
    }
    finally {
        yield session.endSession();
    }
});
exports.TransactionService = {
    addMoney,
    withdrawMoney,
    sendMoney,
    getTransactionById,
    getAllTransactions,
    getTransactionHistory,
    agentCashIn,
    agentCashOut,
};
