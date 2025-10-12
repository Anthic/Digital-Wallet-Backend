import { Schema, model } from "mongoose";
import { IUser, userRole, AccountStatus } from "./user.interface";
import { configEnv } from "../../../config/env";
import bcrypt from "bcrypt";
const userSchema = new Schema<IUser>(
  {
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
      enum: Object.values(userRole),
      default: userRole.USER,
    },
    status: {
      type: String,
      enum: Object.values(AccountStatus),
      default: AccountStatus.ACTIVE,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

userSchema.index({ role: 1 });
userSchema.index({ status: 1 });
userSchema.index({ isDeleted: 1 });
userSchema.index({ createdAt: -1 });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(
    this.password,
    Number(configEnv.BCRYPT_SALT_ROUNDS) || 10
  );
  next();
});
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};
export const User = model<IUser>("User", userSchema);
