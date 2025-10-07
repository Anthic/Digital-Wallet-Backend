import { z } from "zod";
import { userRole, AccountStatus } from "./user.interface";

export const createUserValidationSchema = z.object({
  name: z
    .string({ message: "Name is required" })
    .min(1, "Name cannot be empty")
    .max(100, "Name must be less than 100 characters")
    .trim(),

  email: z
    .string({ message: "Email is required" })
    .email("Please provide a valid email address")
    .toLowerCase()
    .trim(),

  password: z
    .string({ message: "Password is required" })
    .min(8, "Password must be at least 8 characters long")
    .max(128, "Password must be less than 128 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),

  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, "Please provide a valid phone number")
    .optional(),

  address: z
    .string()
    .max(500, "Address must be less than 500 characters")
    .optional(),

  picture: z.string().url("Picture must be a valid URL").optional(),

  role: z
    .nativeEnum(userRole, {
      message: `Role must be one of: ${Object.values(userRole).join(", ")}`,
    })
    .optional(),

  status: z
    .nativeEnum(AccountStatus, {
      message: `Status must be one of: ${Object.values(AccountStatus).join(
        ", "
      )}`,
    })
    .optional(),

  isVerified: z.boolean().optional(),
});
