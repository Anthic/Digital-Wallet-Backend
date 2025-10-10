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
exports.WalletController = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const catchAsync_1 = require("../../../utils/catchAsync");
const wallet_service_1 = require("./wallet.service");
const sendResponse_1 = require("../../../utils/sendResponse");
const appError_1 = __importDefault(require("../../errorHelper/appError"));
const getMyWallet = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId) {
        throw new appError_1.default("User not authenticated", http_status_codes_1.default.UNAUTHORIZED);
    }
    const wallet = yield wallet_service_1.WalletService.getWalletById(userId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
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
}));
const getAllWallets = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const wallets = yield wallet_service_1.WalletService.getAllWallets();
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
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
}));
const blockWallet = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { walletId } = req.params;
    const wallet = yield wallet_service_1.WalletService.updateWalletStatus(walletId, "BLOCKED");
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Wallet unblocked successfully",
        data: {
            walletId: wallet._id,
            status: wallet.status,
            balance: Number((wallet.balance / 100).toFixed(2))
        }
    });
}));
const unblockWallet = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { walletId } = req.params;
    const wallet = yield wallet_service_1.WalletService.updateWalletStatus(walletId, "ACTIVE");
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Wallet unblocked successfully",
        data: wallet,
    });
}));
exports.WalletController = {
    getMyWallet,
    getAllWallets,
    blockWallet,
    unblockWallet,
};
