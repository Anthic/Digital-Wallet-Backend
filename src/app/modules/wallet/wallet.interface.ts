import { Types } from "mongoose";

export enum WalletStatus {
  ACTIVE = "ACTIVE",
  BLOCKED = "BLOCKED",
  SUSPENDED = "SUSPENDED",
}

export interface IWallet {
  _id?: Types.ObjectId;
  userId: Types.ObjectId;
  balance: number; // small unit e hisab hbe poisha
  currency: string;
  status: WalletStatus;
  isDeleted: boolean;
  createAt?: Date;
  updateAt?: Date;
}
