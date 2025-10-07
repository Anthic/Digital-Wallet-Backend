import { Request, Response } from "express";
import { catchAsync } from "../../../utils/catchAsync";
import { AuthService } from "./auth.service";
import { sendResponse } from "../../../utils/sendResponse";
import httpstatuscode from "http-status-codes";
import { setAuthToken } from "../../../utils/setAuthToken";
import AppError from "../../errorHelper/appError";

const credentialLogin = catchAsync(async (req: Request, res: Response) => {
  const loginInfo = await AuthService.credentialLogin(req.body);
  setAuthToken(res, loginInfo);
  sendResponse(res, {
    statusCode: httpstatuscode.OK,
    success: true,
    message: "User Login successfully",
    data: loginInfo,
  });
});

const getNewAccessToken = catchAsync(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    throw new AppError("Refresh token doesnt get", httpstatuscode.BAD_REQUEST);
  }
  const tokenInfo = await AuthService.getNewAccessToken(refreshToken as string);
  sendResponse(res, {
    statusCode: httpstatuscode.OK,
    success: true,
    message: "Token access successfully",
    data: tokenInfo,
  });
});

const logout = catchAsync(async (req: Request, res: Response) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });
  sendResponse(res, {
    statusCode: httpstatuscode.OK,
    success: true,
    message: "User logout successfully",
    data: null,
  });
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const newPassword = req.body.newPassword;
  const oldPassword = req.body.oldPassword;
  const decodedToken = req.user;

  // Type guard to ensure decodedToken exists
  if (!decodedToken) {
    throw new AppError(
      "User authentication required",
      httpstatuscode.UNAUTHORIZED
    );
  }

  await AuthService.resetPassword(oldPassword, newPassword, decodedToken);

  sendResponse(res, {
    statusCode: httpstatuscode.OK,
    success: true,
    message: "Password changed successfully",
    data: null,
  });
});

export const AuthController = {
  credentialLogin,
  getNewAccessToken,
  logout,
  resetPassword,
};
