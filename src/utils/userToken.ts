import AppError from "../app/errorHelper/appError";
import { AccountStatus, IUser } from "../app/modules/users/user.interface";
import httpStatusCode from "http-status-codes";
import { generateToken, verifyToken } from "./jwt";
import { configEnv } from "../config/env";
import { JwtPayload } from "jsonwebtoken";
import { User } from "../app/modules/users/user.model";
export const createUserToken = (user: Partial<IUser>) => {
  if (!user._id || !user.email || !user.role) {
    throw new AppError("Invalid user data", httpStatusCode.UNAUTHORIZED);
  }

  const jwtPayload = {
    userId: user._id,
    email: user.email,
    role: user.role,
  };

  const accessToken = generateToken(
    jwtPayload,
    configEnv.JWT_SECRET,
    configEnv.JWT_EXPIRES_IN
  );
  const refreshToken = generateToken(
    jwtPayload,
    configEnv.JWT_REFRESH_SECRET,
    configEnv.JWT_REFRESH_EXPIRES
  );
  return {
    accessToken,
    refreshToken,
  };
};

export const createNewAccessTokenWithRefreshToken = async (
  refreshToken: string
) => {
  const verifyRefreshToken = verifyToken(
    refreshToken,
    configEnv.JWT_REFRESH_SECRET
  ) as JwtPayload;

  const userExists = await User.findOne({ email: verifyRefreshToken.email });

  if (!userExists) {
    throw new AppError("User does not exist", httpStatusCode.NOT_FOUND);
  }
  if (
    userExists.status === AccountStatus.BLOCKED ||
    userExists.status === AccountStatus.SUSPENDED
  ) {
    throw new AppError(
      `User is ${userExists.status}`,
      httpStatusCode.FORBIDDEN
    );
  }

  if (userExists.isDeleted) {
    throw new AppError("User is deleted", httpStatusCode.NOT_FOUND);
  }

  const jwtPayload = {
    userId: userExists._id,
    email: userExists.email,
    role: userExists.role,
  };
  const accessToken = generateToken(
    jwtPayload,
    configEnv.JWT_SECRET,
    configEnv.JWT_EXPIRES_IN
  );
  return {
    accessToken,
  };
};
