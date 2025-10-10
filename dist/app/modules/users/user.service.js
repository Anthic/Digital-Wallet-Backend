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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const appError_1 = __importDefault(require("../../errorHelper/appError"));
const user_model_1 = require("./user.model");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const mongoose_1 = __importDefault(require("mongoose"));
const wallet_service_1 = require("../wallet/wallet.service");
const createUser = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = payload, rest = __rest(payload, ["email", "password"]);
    if (!password) {
        throw new appError_1.default("Password is required", http_status_codes_1.default.BAD_REQUEST);
    }
    const userExists = yield user_model_1.User.findOne({ email });
    if (userExists) {
        throw new appError_1.default("User already exists", http_status_codes_1.default.BAD_REQUEST);
    }
    const session = yield mongoose_1.default.startSession();
    try {
        session.startTransaction();
        const user = yield user_model_1.User.create([
            Object.assign({ email,
                password }, rest),
        ], { session });
        yield wallet_service_1.WalletService.createWallet(user[0]._id);
        yield session.commitTransaction();
        return user[0];
    }
    catch (error) {
        yield session.abortTransaction();
        throw error;
    }
    finally {
        session.endSession();
    }
});
exports.UserService = {
    createUser,
};
