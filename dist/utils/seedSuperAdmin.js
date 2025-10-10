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
exports.seedSuperAdmin = void 0;
const user_model_1 = require("../app/modules/users/user.model");
const env_1 = require("../config/env");
const bcrypt_1 = __importDefault(require("bcrypt"));
const user_interface_1 = require("../app/modules/users/user.interface");
const seedSuperAdmin = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const isSuperAdminExist = yield user_model_1.User.findOne({
            email: env_1.configEnv.Supper_Admin_Email,
        });
        if (isSuperAdminExist) {
            console.log("Super admin already exist");
            return;
        }
        console.log(" Tring to create super admin");
        const hashedPassword = yield bcrypt_1.default.hash(env_1.configEnv.Password, Number(env_1.configEnv.BCRYPT_SALT_ROUNDS));
        const payload = {
            name: "Super Admin",
            email: env_1.configEnv.Supper_Admin_Email,
            role: user_interface_1.userRole.ADMIN,
            password: hashedPassword,
            status: user_interface_1.AccountStatus.ACTIVE,
            isVerified: true,
            isDeleted: false,
        };
        const superAdmin = yield user_model_1.User.create(payload);
        console.log("supper admin created successful", superAdmin);
    }
    catch (error) {
        console.log(error);
    }
});
exports.seedSuperAdmin = seedSuperAdmin;
