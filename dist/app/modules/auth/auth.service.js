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
exports.AuthService = void 0;
const appError_1 = __importDefault(require("../../errorHelper/appError"));
const user_model_1 = require("../users/user.model");
const bcrypt_1 = __importDefault(require("bcrypt"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const userToken_1 = require("../../../utils/userToken");
const env_1 = require("../../../config/env");
const credentialLogin = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = payload;
    const userExists = yield user_model_1.User.findOne({ email }).select("+password");
    if (!userExists || !(userExists === null || userExists === void 0 ? void 0 : userExists.password)) {
        throw new appError_1.default("Invalid email or password", http_status_codes_1.default.UNAUTHORIZED);
    }
    const isMatch = yield bcrypt_1.default.compare(password, userExists.password);
    if (!isMatch) {
        throw new appError_1.default("Incorrect password", http_status_codes_1.default.UNAUTHORIZED);
    }
    const userToken = (0, userToken_1.createUserToken)(userExists);
    const userObject = userExists.toObject();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const userWithoutPassword = ((_a) => {
        var { password } = _a, rest = __rest(_a, ["password"]);
        return rest;
    })(userObject);
    return {
        accessToken: userToken.accessToken,
        refreshToken: userToken.refreshToken,
        user: userWithoutPassword,
    };
});
const getNewAccessToken = (refreshToken) => __awaiter(void 0, void 0, void 0, function* () {
    const createNewAccessToken = yield (0, userToken_1.createNewAccessTokenWithRefreshToken)(refreshToken);
    return {
        accessToken: createNewAccessToken,
    };
});
const resetPassword = (oldPassword, newPassword, decodedToken) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(decodedToken.userId);
    if (!user) {
        throw new appError_1.default("User not found", http_status_codes_1.default.NOT_FOUND);
    }
    const isOldPasswordMatch = yield bcrypt_1.default.compare(oldPassword, user.password);
    if (!isOldPasswordMatch) {
        throw new appError_1.default("Old password is incorrect", http_status_codes_1.default.UNAUTHORIZED);
    }
    user.password = yield bcrypt_1.default.hash(newPassword, Number(env_1.configEnv.BCRYPT_SALT_ROUNDS));
    yield user.save();
});
exports.AuthService = {
    credentialLogin,
    getNewAccessToken,
    resetPassword,
};
