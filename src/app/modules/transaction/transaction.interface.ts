import { Types } from "mongoose";

export enum TransactionType {
  TOP_UP = "TOP_UP",
  WITHDRAW = "WITHDRAW",
  SEND_MONEY = "SEND_MONEY",
  CASH_IN = "CASH_IN",
  CASH_OUT = "CASH_OUT",
}

export enum TransactionStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  REVERSED = "REVERSED",
}
export interface ITransaction {
  _id?: Types.ObjectId;
  fromWallet?: Types.ObjectId;
  toWallet?: Types.ObjectId;
  amount: number;
  fee?: number;
  commission?: number;
  type: TransactionType;
  status: TransactionStatus;
  description?: string;
  reference: string;
  initiatedBy: Types.ObjectId;
  agentId?: Types.ObjectId;
  metadata?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}
