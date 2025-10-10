"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendResponse = void 0;
const sendResponse = (res, data) => {
    res.status(data.statusCode).json({
        statusCode: data.statusCode,
        message: data.message,
        success: data.success,
        meta: data.meta,
        data: data.data,
    });
};
exports.sendResponse = sendResponse;
