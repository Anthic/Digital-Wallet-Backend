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
exports.checkAuth = void 0;
const appError_1 = __importDefault(require("../errorHelper/appError"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const jwt_1 = require("../../utils/jwt");
const env_1 = require("../../config/env");
const user_model_1 = require("../modules/users/user.model");
const user_interface_1 = require("../modules/users/user.interface");
const checkAuth = (...authRoles) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const accessToken = req.headers.authorization;
            if (!accessToken) {
                throw new appError_1.default("Access token required", http_status_codes_1.default.UNAUTHORIZED);
            }
            const varifiedToken = (0, jwt_1.verifyToken)(accessToken, env_1.configEnv.JWT_SECRET);
            const userExists = yield user_model_1.User.findOne({
                email: varifiedToken.email,
            });
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
            if (!authRoles.includes(varifiedToken.role)) {
                throw new appError_1.default("You are not authorized to access this route", http_status_codes_1.default.UNAUTHORIZED);
            }
            req.user = varifiedToken;
            next();
        }
        catch (error) {
            next(error);
        }
    });
};
exports.checkAuth = checkAuth;
