"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configEnv = void 0;
/* eslint-disable @typescript-eslint/no-non-null-assertion */
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const loadEnvVariable = () => {
    const requiredEnvVariables = [
        "PORT",
        "MONGO_URL",
        "NODE_ENV",
        "JWT_SECRET",
        "JWT_EXPIRES_IN",
        "BCRYPT_SALT_ROUNDS",
        "JWT_REFRESH_SECRET",
        "JWT_REFRESH_EXPIRES",
        "Supper_Admin_Email",
        "Password",
    ];
    requiredEnvVariables.forEach((envVar) => {
        if (!process.env[envVar]) {
            throw new Error(`Environment variable ${envVar} is not defined`);
        }
    });
    return {
        PORT: process.env.PORT,
        MONGO_URL: process.env.MONGO_URL,
        NODE_ENV: process.env.NODE_ENV,
        JWT_SECRET: process.env.JWT_SECRET,
        JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
        BCRYPT_SALT_ROUNDS: process.env.BCRYPT_SALT_ROUNDS,
        JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
        JWT_REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES,
        Supper_Admin_Email: process.env.Supper_Admin_Email,
        Password: process.env.Password,
    };
};
exports.configEnv = loadEnvVariable();
