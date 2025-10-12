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
exports.validationUser = void 0;
const zod_1 = require("zod");
const appError_1 = __importDefault(require("../errorHelper/appError"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const validationUser = (zodSchema) => (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        req.body = yield zodSchema.parseAsync(req.body);
        next();
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            const formattedErrors = error.issues.map((err) => {
                const baseError = {
                    field: err.path.join(".") || "unknown",
                    message: err.message,
                };
                if (err.code === "invalid_type") {
                    const invalidTypeErr = err;
                    return Object.assign(Object.assign({}, baseError), { received: invalidTypeErr.received, expected: invalidTypeErr.expected });
                }
                return baseError;
            });
            const errorMessage = formattedErrors
                .map((err) => `${err.field}: ${err.message}`)
                .join(", ");
            next(new appError_1.default(`Validation failed: ${errorMessage}`, http_status_codes_1.default.BAD_REQUEST));
        }
        else {
            next(error);
        }
    }
});
exports.validationUser = validationUser;
