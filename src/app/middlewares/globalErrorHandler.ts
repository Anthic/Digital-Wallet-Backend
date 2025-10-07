import { NextFunction, Request, Response } from "express";
import AppError from "../errorHelper/appError";
import { configEnv } from "../../config/env";
import { ZodError } from "zod";
import { Error as MongooseError } from "mongoose";

export const globalErrorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = "Something went wrong!";
  let errorDetails = null;


  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  }

  else if (error instanceof ZodError) {
    statusCode = 400;
    message = "Validation failed";
    errorDetails = error.issues.map((issue) => ({
      field: issue.path.join(".") || "unknown",
      message: issue.message,
    }));
  }
  
  else if (error.code === 11000) {
    statusCode = 400;
    const field = Object.keys(error.keyValue || {})[0];
    message = `${field} already exists. Please use a different ${field}.`;
  }
  
  else if (error instanceof MongooseError.ValidationError) {
    statusCode = 400;
    message = "Validation failed";
    errorDetails = Object.values(error.errors).map((err: any) => ({
      field: err.path,
      message: err.message,
    }));
  }
 
  else if (error instanceof MongooseError.CastError) {
    statusCode = 400;
    message = `Invalid ${error.path}: ${error.value}`;
  }
  
  else if (error instanceof Error) {
    message = error.message;
  }


  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    ...(errorDetails && { errors: errorDetails }),
    ...(configEnv.NODE_ENV === "development" && {
      stack: error.stack,
      fullError: error,
    }),
  });
};
