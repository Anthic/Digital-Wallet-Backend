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
exports.User = void 0;
const mongoose_1 = require("mongoose");
const user_interface_1 = require("./user.interface");
const env_1 = require("../../../config/env");
const bcrypt_1 = __importDefault(require("bcrypt"));
const userSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true,
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: 6,
        select: false,
    },
    phone: {
        type: String,
        trim: true,
        sparse: true,
    },
    address: {
        type: String,
        trim: true,
    },
    picture: {
        type: String,
    },
    role: {
        type: String,
        enum: Object.values(user_interface_1.userRole),
        default: user_interface_1.userRole.USER,
    },
    status: {
        type: String,
        enum: Object.values(user_interface_1.AccountStatus),
        default: user_interface_1.AccountStatus.ACTIVE,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
    versionKey: false,
});
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });
userSchema.index({ isDeleted: 1 });
userSchema.index({ createdAt: -1 });
userSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.isModified("password"))
            return next();
        this.password = yield bcrypt_1.default.hash(this.password, Number(env_1.configEnv.BCRYPT_SALT_ROUNDS) || 10);
        next();
    });
});
userSchema.methods.comparePassword = function (candidatePassword) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield bcrypt_1.default.compare(candidatePassword, this.password);
    });
};
userSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    return user;
};
exports.User = (0, mongoose_1.model)("User", userSchema);
