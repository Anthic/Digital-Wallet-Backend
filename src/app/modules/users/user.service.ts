import AppError from "../../errorHelper/appError";
import { IUser } from "./user.interface";
import { User } from "./user.model";
import httpStatusCode from "http-status-codes";

import bycripts from "bcrypt";
import mongoose from "mongoose";
import { WalletService } from "../wallet/wallet.service";
const createUser = async (payload: Partial<IUser>) => {
  const { email, password, ...rest } = payload;
  if (!password) {
    throw new AppError("Password is required", httpStatusCode.BAD_REQUEST);
  }
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new AppError("User already exists", httpStatusCode.BAD_REQUEST);
  }
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const user = await User.create(
      [
        {
          email,
          password,
          ...rest,
        },
      ],
      { session }
    );
    await WalletService.createWallet(user[0]._id);

    await session.commitTransaction();

    return user[0];
  } catch (error) {
    await session.abortTransaction();

    throw error;
  } finally {
    session.endSession();
  }
};

export const UserService = {
  createUser,
};
