"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUserValidationSchema = void 0;
const zod_1 = require("zod");
const user_interface_1 = require("./user.interface");
exports.createUserValidationSchema = zod_1.z.object({
    name: zod_1.z
        .string({ message: "Name is required" })
        .min(1, "Name cannot be empty")
        .max(100, "Name must be less than 100 characters")
        .trim(),
    email: zod_1.z
        .string({ message: "Email is required" })
        .email("Please provide a valid email address")
        .toLowerCase()
        .trim(),
    password: zod_1.z
        .string({ message: "Password is required" })
        .min(8, "Password must be at least 8 characters long")
        .max(128, "Password must be less than 128 characters")
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least one uppercase letter, one lowercase letter, and one number"),
    phone: zod_1.z
        .string()
        .regex(/^\+?[1-9]\d{1,14}$/, "Please provide a valid phone number")
        .optional(),
    address: zod_1.z
        .string()
        .max(500, "Address must be less than 500 characters")
        .optional(),
    picture: zod_1.z.string().url("Picture must be a valid URL").optional(),
    role: zod_1.z
        .nativeEnum(user_interface_1.userRole, {
        message: `Role must be one of: ${Object.values(user_interface_1.userRole).join(", ")}`,
    })
        .optional(),
    status: zod_1.z
        .nativeEnum(user_interface_1.AccountStatus, {
        message: `Status must be one of: ${Object.values(user_interface_1.AccountStatus).join(", ")}`,
    })
        .optional(),
    isVerified: zod_1.z.boolean().optional(),
});
