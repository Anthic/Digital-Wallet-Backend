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
exports.TransactionController = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const catchAsync_1 = require("../../../utils/catchAsync");
const appError_1 = __importDefault(require("../../errorHelper/appError"));
const transaction_service_1 = require("./transaction.service");
const sendResponse_1 = require("../../../utils/sendResponse");
const user_model_1 = require("../users/user.model");
const addMoney = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const { amount, description } = req.body;
    if (!userId) {
        throw new appError_1.default("User not authenticated", http_status_codes_1.default.UNAUTHORIZED);
    }
    const amountInPaisa = Math.round(amount * 100);
    if (amountInPaisa < 100) {
        throw new appError_1.default("Minimum amount is ৳1", http_status_codes_1.default.BAD_REQUEST);
    }
    const transaction = yield transaction_service_1.TransactionService.addMoney(userId, amountInPaisa, description);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.CREATED,
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
}));
const withdrawMoney = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const { amount, description } = req.body;
    if (!userId) {
        throw new appError_1.default("User not authenticated", http_status_codes_1.default.UNAUTHORIZED);
    }
    const amountInPaisa = Math.round(amount * 100);
    if (amountInPaisa < 100) {
        throw new appError_1.default("Minimum amount is ৳1", http_status_codes_1.default.BAD_REQUEST);
    }
    const transaction = yield transaction_service_1.TransactionService.withdrawMoney(userId, amountInPaisa, description);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.CREATED,
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
}));
const sendMoney = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const { receiverEmail, amount, description } = req.body;
    if (!userId) {
        throw new appError_1.default("User not authenticated", http_status_codes_1.default.UNAUTHORIZED);
    }
    if (!receiverEmail || !amount) {
        throw new appError_1.default("Receiver email and amount are required", http_status_codes_1.default.BAD_REQUEST);
    }
    const amountInPaisa = Math.round(amount * 100);
    if (amountInPaisa < 100) {
        throw new appError_1.default("Minimum amount is ৳1", http_status_codes_1.default.BAD_REQUEST);
    }
    if (amountInPaisa > 2500000) {
        throw new appError_1.default("Maximum send amount is ৳25,000", http_status_codes_1.default.BAD_REQUEST);
    }
    const currentUser = yield user_model_1.User.findById(userId);
    if ((currentUser === null || currentUser === void 0 ? void 0 : currentUser.email) === receiverEmail) {
        throw new appError_1.default("Cannot send money to yourself", http_status_codes_1.default.BAD_REQUEST);
    }
    const transaction = yield transaction_service_1.TransactionService.sendMoney(userId, receiverEmail, amountInPaisa, description);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.CREATED,
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
}));
const getMyTransactions = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const type = req.query.type;
    const status = req.query.status;
    if (!userId) {
        throw new appError_1.default("User not authenticated", http_status_codes_1.default.UNAUTHORIZED);
    }
    if (page < 1 || limit < 1 || limit > 100) {
        throw new appError_1.default("Invalid pagination parameters", http_status_codes_1.default.BAD_REQUEST);
    }
    const { transactions, total } = yield transaction_service_1.TransactionService.getTransactionHistory(userId, page, limit, type, status);
    const formattedTransactions = transactions.map((transaction) => {
        var _a;
        const isIncoming = transaction.toWallet &&
            ((_a = transaction.toWallet.userId) === null || _a === void 0 ? void 0 : _a.toString()) === userId.toString();
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
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
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
}));
const getAllTransactions = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const type = req.query.type;
    const status = req.query.status;
    if (page < 1 || limit < 1 || limit > 100) {
        throw new appError_1.default("Invalid pagination parameters", http_status_codes_1.default.BAD_REQUEST);
    }
    const { transactions, total } = yield transaction_service_1.TransactionService.getAllTransactions(page, limit, type, status);
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
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
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
}));
const getTransactionDetails = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const { transactionId } = req.params;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const userRole = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
    if (!userId) {
        throw new appError_1.default("User not authenticated", http_status_codes_1.default.UNAUTHORIZED);
    }
    if (!transactionId) {
        throw new appError_1.default("Transaction ID is required", http_status_codes_1.default.BAD_REQUEST);
    }
    const transaction = yield transaction_service_1.TransactionService.getTransactionById(transactionId, userId, userRole);
    const isIncoming = transaction.toWallet &&
        ((_c = transaction.toWallet.userId) === null || _c === void 0 ? void 0 : _c.toString()) === userId.toString();
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
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
            direction: userRole === "ADMIN" ? null : isIncoming ? "INCOMING" : "OUTGOING",
            initiatedBy: transaction.initiatedBy,
            fromWallet: transaction.fromWallet,
            toWallet: transaction.toWallet,
            agentId: transaction.agentId,
            metadata: transaction.metadata,
            createdAt: transaction.createdAt,
            updatedAt: transaction.updatedAt,
        },
    });
}));
const agentCashIn = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const agentId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const { userEmail, amount, description } = req.body;
    if (!agentId) {
        throw new appError_1.default("Agent not authenticated", http_status_codes_1.default.UNAUTHORIZED);
    }
    const amountInPaisa = Math.round(amount * 100);
    if (amountInPaisa < 100) {
        throw new appError_1.default("Minimum amount is ৳1", http_status_codes_1.default.BAD_REQUEST);
    }
    const transaction = yield transaction_service_1.TransactionService.agentCashIn(agentId, userEmail, amountInPaisa, description);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.CREATED,
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
}));
const agentCashOut = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const agentId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const { userEmail, amount, description } = req.body;
    if (!agentId) {
        throw new appError_1.default("Agent not authenticated", http_status_codes_1.default.UNAUTHORIZED);
    }
    const amountInPaisa = Math.round(amount * 100);
    if (amountInPaisa < 100) {
        throw new appError_1.default("Minimum amount is ৳1", http_status_codes_1.default.BAD_REQUEST);
    }
    const transaction = yield transaction_service_1.TransactionService.agentCashOut(agentId, userEmail, amountInPaisa, description);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.CREATED,
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
}));
exports.TransactionController = {
    addMoney,
    withdrawMoney,
    sendMoney,
    getMyTransactions,
    getAllTransactions,
    getTransactionDetails,
    agentCashIn,
    agentCashOut,
};
