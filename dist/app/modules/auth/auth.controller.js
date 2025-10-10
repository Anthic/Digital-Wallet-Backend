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
exports.AuthController = void 0;
const catchAsync_1 = require("../../../utils/catchAsync");
const auth_service_1 = require("./auth.service");
const sendResponse_1 = require("../../../utils/sendResponse");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const setAuthToken_1 = require("../../../utils/setAuthToken");
const appError_1 = __importDefault(require("../../errorHelper/appError"));
const credentialLogin = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const loginInfo = yield auth_service_1.AuthService.credentialLogin(req.body);
    (0, setAuthToken_1.setAuthToken)(res, loginInfo);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "User Login successfully",
        data: loginInfo,
    });
}));
const getNewAccessToken = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        throw new appError_1.default("Refresh token doesnt get", http_status_codes_1.default.BAD_REQUEST);
    }
    const tokenInfo = yield auth_service_1.AuthService.getNewAccessToken(refreshToken);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Token access successfully",
        data: tokenInfo,
    });
}));
const logout = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
    });
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
    });
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "User logout successfully",
        data: null,
    });
}));
const resetPassword = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const newPassword = req.body.newPassword;
    const oldPassword = req.body.oldPassword;
    const decodedToken = req.user;
    // Type guard to ensure decodedToken exists
    if (!decodedToken) {
        throw new appError_1.default("User authentication required", http_status_codes_1.default.UNAUTHORIZED);
    }
    yield auth_service_1.AuthService.resetPassword(oldPassword, newPassword, decodedToken);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Password changed successfully",
        data: null,
    });
}));
exports.AuthController = {
    credentialLogin,
    getNewAccessToken,
    logout,
    resetPassword,
};
