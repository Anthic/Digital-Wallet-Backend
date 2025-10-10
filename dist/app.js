"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const indexRouter_1 = require("./app/Routers/indexRouter");
const globalErrorHandler_1 = require("./app/middlewares/globalErrorHandler");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use("/api/v1", indexRouter_1.router);
app.get("/", (req, res) => {
    res.status(200).json({
        message: "Welcome to the Digital-Wallet-Backend ",
    });
});
app.use(globalErrorHandler_1.globalErrorHandler);
exports.default = app;
