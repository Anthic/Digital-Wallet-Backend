import AppError from "../../errorHelper/appError";
import { IUser } from "../users/user.interface";
import { User } from "../users/user.model";
import bycripts from "bcrypt";
import httpStatusCode from "http-status-codes";
import {
  createNewAccessTokenWithRefreshToken,
  createUserToken,
} from "../../../utils/userToken";
import { JwtPayload } from "jsonwebtoken";
import { configEnv } from "../../../config/env";

const credentialLogin = async (payload: Partial<IUser>) => {
  const { email, password } = payload;

  const userExists = await User.findOne({ email }).select("+password");

  if (!userExists || !userExists?.password) {
    throw new AppError(
      "Invalid email or password",
      httpStatusCode.UNAUTHORIZED
    );
  }

  const isMatch = await bycripts.compare(
    password as string,
    userExists.password
  );
  if (!isMatch) {
    throw new AppError("Incorrect password", httpStatusCode.UNAUTHORIZED);
  }
  
  const userToken = createUserToken(userExists);


  const userObject = userExists.toObject();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const userWithoutPassword = (({ password, ...rest }) => rest)(userObject);

  return {
    accessToken: userToken.accessToken,
    refreshToken: userToken.refreshToken,
    user: userWithoutPassword,
  };
};

const getNewAccessToken = async (refreshToken: string) => {
  const createNewAccessToken = await createNewAccessTokenWithRefreshToken(
    refreshToken
  );
  return {
    accessToken: createNewAccessToken,
  };
};

const resetPassword = async (
  oldPassword: string,
  newPassword: string,
  decodedToken: JwtPayload
) => {
  const user = await User.findById(decodedToken.userId);

  if (!user) {
    throw new AppError("User not found", httpStatusCode.NOT_FOUND);
  }

  const isOldPasswordMatch = await bycripts.compare(
    oldPassword,
    user.password as string
  );

  if (!isOldPasswordMatch) {
    throw new AppError(
      "Old password is incorrect",
      httpStatusCode.UNAUTHORIZED
    );
  }

  user.password = await bycripts.hash(
    newPassword,
    Number(configEnv.BCRYPT_SALT_ROUNDS)
  );

  await user.save();
};

export const AuthService = {
  credentialLogin,
  getNewAccessToken,
  resetPassword,
};
