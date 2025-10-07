import { Types } from "mongoose";

export enum userRole {
  ADMIN = "ADMIN",
  AGENT = "AGENT",
  USER = "USER",
}

export enum AccountStatus {
  ACTIVE = "ACTIVE",
  BLOCKED = "BLOCKED",
  SUSPENDED = "SUSPENDED",
}
export interface IUser {
  _id?: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  picture?: string;
  role: userRole;
  status: AccountStatus;
  isVerified?: boolean;
  isDeleted?: boolean;
}
