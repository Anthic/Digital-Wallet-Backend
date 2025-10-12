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
exports.AdminController = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const catchAsync_1 = require("../../../utils/catchAsync");
const sendResponse_1 = require("../../../utils/sendResponse");
const wallet_model_1 = require("../wallet/wallet.model");
const appError_1 = __importDefault(require("../../errorHelper/appError"));
const user_model_1 = require("../users/user.model");
const getAllUsers = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    const page = parseInt(query.page || "1") || 1;
    const limit = parseInt(query.limit || "10") || 10;
    const role = query.role;
    const skip = (page - 1) * limit;
    const userQuery = { isDeleted: false };
    if (role) {
        userQuery.role = role.toUpperCase();
    }
    const users = yield user_model_1.User.find(userQuery)
        .select("-password")
        .populate("walletId", "balance status")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });
    const total = yield user_model_1.User.countDocuments(userQuery);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
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
}));
const getAllWallets = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    const page = parseInt(query.page || "1") || 1;
    const limit = parseInt(query.limit || "10") || 10;
    const status = query.status;
    const skip = (page - 1) * limit;
    const walletQuery = { isDeleted: false };
    if (status) {
        walletQuery.status = status.toUpperCase();
    }
    const wallets = yield wallet_model_1.Wallet.find(walletQuery)
        .populate("userId", "name email role")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });
    const total = yield wallet_model_1.Wallet.countDocuments(walletQuery);
    const formattedWallets = wallets.map((wallet) => ({
        walletId: wallet._id,
        balance: Number((wallet.balance / 100).toFixed(2)),
        status: wallet.status,
        currency: wallet.currency,
        user: wallet.userId,
        createdAt: wallet.createAt,
        updatedAt: wallet.updateAt,
    }));
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
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
}));
const toggleWalletStatus = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { walletId } = req.params;
    const { status } = req.body;
    if (!["ACTIVE", "BLOCKED"].includes(status)) {
        throw new appError_1.default("Invalid status. Use ACTIVE or BLOCKED", http_status_codes_1.default.BAD_REQUEST);
    }
    const wallet = yield wallet_model_1.Wallet.findByIdAndUpdate(walletId, { status }, { new: true }).populate("userId", "name email role");
    if (!wallet) {
        throw new appError_1.default("Wallet not found", http_status_codes_1.default.NOT_FOUND);
    }
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: `Wallet ${status.toLowerCase()} successfully`,
        data: {
            walletId: wallet._id,
            status: wallet.status,
            balance: Number((wallet.balance / 100).toFixed(2)),
            user: wallet.userId,
        },
    });
}));
const toggleAgentStatus = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { agentId } = req.params;
    const { status } = req.body;
    if (!["ACTIVE", "SUSPENDED"].includes(status)) {
        throw new appError_1.default("Invalid status. Use ACTIVE or SUSPENDED", http_status_codes_1.default.BAD_REQUEST);
    }
    const agent = yield user_model_1.User.findOneAndUpdate({ _id: agentId, role: "AGENT" }, { status }, { new: true }).select("-password");
    if (!agent) {
        throw new appError_1.default("Agent not found", http_status_codes_1.default.NOT_FOUND);
    }
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: `Agent ${status.toLowerCase()} successfully`,
        data: agent,
    });
}));
exports.AdminController = {
    getAllUsers,
    getAllWallets,
    toggleWalletStatus,
    toggleAgentStatus,
};
