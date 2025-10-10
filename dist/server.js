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
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("./config/env");
const app_1 = __importDefault(require("./app"));
const seedSuperAdmin_1 = require("./utils/seedSuperAdmin");
let server;
const startSever = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield mongoose_1.default.connect(env_1.configEnv.MONGO_URL);
        console.log("Connected to MongoDB successfully");
        server = app_1.default.listen(env_1.configEnv.PORT, () => {
            console.log("Server is running on 5000");
        });
    }
    catch (error) {
        console.log("Error connecting to MongoDB:", error);
    }
});
(() => __awaiter(void 0, void 0, void 0, function* () {
    yield startSever();
    yield (0, seedSuperAdmin_1.seedSuperAdmin)();
}))();
//error handling for graceful shutdown
//handle graceful shutdown singals error from server aws/docker etc
process.on("SIGTERM", (error) => {
    console.log("SIGTERM Rejection shutting down server", error);
    if (server) {
        server.close(() => {
            console.log("Server is closed due to unhandled rejection");
            process.exit(1);
        });
    }
    else {
        process.exit(1);
    }
});
//Handle gracefull shutdown unhandled rejections
process.on("unhandleRejection", (error) => {
    console.log("Unhandled Rejection,shutting down server", error);
    if (server) {
        server.close(() => {
            console.log("Server closed due to unhandled rejection");
            process.exit(1);
        });
    }
    else {
        process.exit(1);
    }
});
// Handle graceful shutdown uncaught exceptions
process.on("uncaughtException", (error) => {
    console.log("Uncaught Exception, shutting down server!", error);
    if (server) {
        server.close(() => {
            console.log("Server closed due to uncaught exception");
            process.exit(1);
        });
    }
    else {
        process.exit(1);
    }
});
