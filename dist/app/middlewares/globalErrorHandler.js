"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = void 0;
const appError_1 = __importDefault(require("../errorHelper/appError"));
const env_1 = require("../../config/env");
const zod_1 = require("zod");
const mongoose_1 = require("mongoose");
const globalErrorHandler = (error, req, res, next) => {
    let statusCode = 500;
    let message = "Something went wrong!";
    let errorDetails = null;
    if (error instanceof appError_1.default) {
        statusCode = error.statusCode;
        message = error.message;
    }
    else if (error instanceof zod_1.ZodError) {
        statusCode = 400;
        message = "Validation failed";
        errorDetails = error.issues.map((issue) => ({
            field: issue.path.join(".") || "unknown",
            message: issue.message,
        }));
    }
    else if (error.code === 11000) {
        statusCode = 400;
        const field = Object.keys(error.keyValue || {})[0];
        message = `${field} already exists. Please use a different ${field}.`;
    }
    else if (error instanceof mongoose_1.Error.ValidationError) {
        statusCode = 400;
        message = "Validation failed";
        errorDetails = Object.values(error.errors).map((err) => ({
            field: err.path,
            message: err.message,
        }));
    }
    else if (error instanceof mongoose_1.Error.CastError) {
        statusCode = 400;
        message = `Invalid ${error.path}: ${error.value}`;
    }
    else if (error instanceof Error) {
        message = error.message;
    }
    res.status(statusCode).json(Object.assign(Object.assign({ success: false, statusCode,
        message }, (errorDetails && { errors: errorDetails })), (env_1.configEnv.NODE_ENV === "development" && {
        stack: error.stack,
        fullError: error,
    })));
};
exports.globalErrorHandler = globalErrorHandler;
