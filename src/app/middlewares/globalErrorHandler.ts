import { NextFunction, Request, Response } from "express";
import AppError from "../errorHelper/appError";
import { configEnv } from "../../config/env";
import { ZodError } from "zod";
import { Error as MongooseError } from "mongoose";

type GlobalError =
  | AppError
  | ZodError
  | MongooseError.ValidationError
  | MongooseError.CastError
  | Error
  | { code: number; keyValue?: Record<string, unknown> }
  | unknown;
export const globalErrorHandler = (
  error: GlobalError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction 
) => {
  let statusCode = 500;
  let message = "Something went wrong!";
  let errorDetails = null;

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  } else if (error instanceof ZodError) {
    statusCode = 400;
    message = "Validation failed";
    errorDetails = error.issues.map((issue) => ({
      field: issue.path.join(".") || "unknown",
      message: issue.message,
    }));
  } else if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    error.code === 11000
  ) {
    statusCode = 400;
    const mongoError = error as { keyValue?: Record<string, unknown> };
    const field = Object.keys(mongoError.keyValue || {})[0];
    message = `${field} already exists. Please use a different ${field}.`;
  } else if (error instanceof MongooseError.ValidationError) {
    statusCode = 400;
    message = "Validation failed";
    errorDetails = Object.values(error.errors).map(
      (err: MongooseError.ValidatorError | MongooseError.CastError) => ({
        field: err.path,
        message: err.message,
      })
    );
  } else if (error instanceof MongooseError.CastError) {
    statusCode = 400;
    message = `Invalid ${error.path}: ${error.value}`;
  } else if (error instanceof Error) {
    message = error.message;
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    ...(errorDetails && { errors: errorDetails }),
    ...(configEnv.NODE_ENV === "development" && {
      stack: error instanceof Error ? error.stack : undefined,
      fullError: error,
    }),
  });
};
