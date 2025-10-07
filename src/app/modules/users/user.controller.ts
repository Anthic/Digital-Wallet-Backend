import { Request, Response } from "express";
import { catchAsync } from "../../../utils/catchAsync";
import { UserService } from "./user.service";
import { sendResponse } from "../../../utils/sendResponse";
import httpstatuscode from "http-status-codes";
const createUser = catchAsync(async (req: Request, res: Response) => {
  const result = req.body;
  const user = await UserService.createUser(result);
  sendResponse(res, {
    statusCode: httpstatuscode.CREATED,
    success: true,
    message: "User created successfully",
    data: user,
  });
});



export const UserController={
    createUser
}
