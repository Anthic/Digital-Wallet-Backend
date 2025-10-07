import AppError from "../../errorHelper/appError";
import { IUser } from "./user.interface";
import { User } from "./user.model";
import httpStatusCode from "http-status-codes";

import bycripts from "bcrypt";
const createUser = async (payload: Partial<IUser>) => {
  const { email, password, ...rest } = payload;
  if (!password) {
    throw new AppError("Password is required", httpStatusCode.BAD_REQUEST);
  }
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new AppError("User already exists", httpStatusCode.BAD_REQUEST);
  }
  const hashedPassword = await bycripts.hash(password as string, 10); 
  const user = await User.create({
    email,
    password: hashedPassword,
    ...rest,
  });
  return user;
};

export const UserService = {
  createUser,
};
