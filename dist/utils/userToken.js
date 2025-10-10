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
exports.createNewAccessTokenWithRefreshToken = exports.createUserToken = void 0;
const appError_1 = __importDefault(require("../app/errorHelper/appError"));
const user_interface_1 = require("../app/modules/users/user.interface");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const jwt_1 = require("./jwt");
const env_1 = require("../config/env");
const user_model_1 = require("../app/modules/users/user.model");
const createUserToken = (user) => {
    if (!user._id || !user.email || !user.role) {
        throw new appError_1.default("Invalid user data", http_status_codes_1.default.UNAUTHORIZED);
    }
    const jwtPayload = {
        userId: user._id,
        email: user.email,
        role: user.role,
    };
    const accessToken = (0, jwt_1.generateToken)(jwtPayload, env_1.configEnv.JWT_SECRET, env_1.configEnv.JWT_EXPIRES_IN);
    const refreshToken = (0, jwt_1.generateToken)(jwtPayload, env_1.configEnv.JWT_REFRESH_SECRET, env_1.configEnv.JWT_REFRESH_EXPIRES);
    return {
        accessToken,
        refreshToken,
    };
};
exports.createUserToken = createUserToken;
const createNewAccessTokenWithRefreshToken = (refreshToken) => __awaiter(void 0, void 0, void 0, function* () {
    const verifyRefreshToken = (0, jwt_1.verifyToken)(refreshToken, env_1.configEnv.JWT_REFRESH_SECRET);
    const userExists = yield user_model_1.User.findOne({ email: verifyRefreshToken.email });
    if (!userExists) {
        throw new appError_1.default("User does not exist", http_status_codes_1.default.NOT_FOUND);
    }
    if (userExists.status === user_interface_1.AccountStatus.BLOCKED ||
        userExists.status === user_interface_1.AccountStatus.SUSPENDED) {
        throw new appError_1.default(`User is ${userExists.status}`, http_status_codes_1.default.FORBIDDEN);
    }
    if (userExists.isDeleted) {
        throw new appError_1.default("User is deleted", http_status_codes_1.default.NOT_FOUND);
    }
    const jwtPayload = {
        userId: userExists._id,
        email: userExists.email,
        role: userExists.role,
    };
    const accessToken = (0, jwt_1.generateToken)(jwtPayload, env_1.configEnv.JWT_SECRET, env_1.configEnv.JWT_EXPIRES_IN);
    return {
        accessToken,
    };
});
exports.createNewAccessTokenWithRefreshToken = createNewAccessTokenWithRefreshToken;
