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
exports.WalletService = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const wallet_interface_1 = require("./wallet.interface");
const wallet_model_1 = require("./wallet.model");
const appError_1 = __importDefault(require("../../errorHelper/appError"));
const createWallet = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const existWallet = yield wallet_model_1.Wallet.findOne({ userId, isDeleted: false });
    if (existWallet) {
        throw new appError_1.default("User already has wallet", http_status_codes_1.default.BAD_REQUEST);
    }
    const wallet = yield wallet_model_1.Wallet.create({
        userId,
        balance: 5000, // 50 taka inital balance
        currency: "BDT",
        status: wallet_interface_1.WalletStatus.ACTIVE,
    });
    return wallet;
});
const getWalletById = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const wallet = yield wallet_model_1.Wallet.findOne({
        userId,
        isDeleted: false,
    }).populate("userId", "name email role");
    if (!wallet) {
        throw new appError_1.default("Wallet not found", http_status_codes_1.default.NOT_FOUND);
    }
    return wallet;
});
const getAllWallets = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const wallet = yield wallet_model_1.Wallet.find({ isDeleted: false })
            .populate("userId", "name email role status")
            .sort({ createdAt: -1 });
        return wallet;
    }
    catch (error) {
        throw new appError_1.default(`Failed to fetch wallets: ${error}`, http_status_codes_1.default.BAD_REQUEST);
    }
});
const updateWalletStatus = (walletId, status) => __awaiter(void 0, void 0, void 0, function* () {
    const wallet = yield wallet_model_1.Wallet.findByIdAndUpdate(walletId, { status }, { new: true, runValidators: true });
    if (!wallet) {
        throw new appError_1.default("Wallet not found", http_status_codes_1.default.NOT_FOUND);
    }
    return wallet;
});
exports.WalletService = {
    createWallet,
    getWalletById,
    getAllWallets,
    updateWalletStatus,
};
