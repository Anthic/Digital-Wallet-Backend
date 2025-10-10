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
exports.zodValidatorTransaction = void 0;
const zod_1 = require("zod");
const catchAsync_1 = require("../../utils/catchAsync");
const appError_1 = __importDefault(require("../errorHelper/appError"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const zodValidatorTransaction = (schema) => {
    return (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const errorMessages = error.issues.map(issue => {
                    const path = issue.path.slice(1).join(".");
                    return `${path}: ${issue.message}`;
                }).join(", ");
                throw new appError_1.default(`Validation Error: ${errorMessages}`, http_status_codes_1.default.BAD_REQUEST);
            }
            throw error;
        }
    }));
};
exports.zodValidatorTransaction = zodValidatorTransaction;
