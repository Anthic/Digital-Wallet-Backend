import { NextFunction, Request, Response } from "express";
import AppError from "../errorHelper/appError";
import httpStatusCode from "http-status-codes";
import { verifyToken } from "../../utils/jwt";
import { configEnv } from "../../config/env";
import { JwtPayload } from "jsonwebtoken";
import { User } from "../modules/users/user.model";
import { AccountStatus } from "../modules/users/user.interface";
export const checkAuth = (...authRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accessToken = req.headers.authorization;
      if (!accessToken) {
        throw new AppError(
          "Access token required",
          httpStatusCode.UNAUTHORIZED
        );
      }

      const varifiedToken = verifyToken(
        accessToken,
        configEnv.JWT_SECRET
      ) as JwtPayload;
   
      const userExists = await User.findOne({
        email: varifiedToken.email,
      });

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
      if (!authRoles.includes(varifiedToken.role)) {
        throw new AppError(
          "You are not authorized to access this route",
          httpStatusCode.UNAUTHORIZED
        );
      }
      req.user = varifiedToken;
      next();
    } catch (error) {
      next(error);
    }
  };
};
