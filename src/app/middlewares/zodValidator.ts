import { NextFunction, Request, Response } from "express";
import { ZodObject, ZodError, ZodIssue } from "zod";
import AppError from "../errorHelper/appError";
import httpStatusCode from "http-status-codes";

export const validationUser =
  (zodSchema: ZodObject<any>) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await zodSchema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
       
        const formattedErrors = error.issues.map((err: ZodIssue) => ({
          field: err.path.join(".") || "unknown",
          message: err.message,
          received:
            err.code === "invalid_type" ? (err as any).received : undefined,
          expected:
            err.code === "invalid_type" ? (err as any).expected : undefined,
        }));

        const errorMessage = formattedErrors
          .map((err: any) => `${err.field}: ${err.message}`)
          .join(", ");

        next(
          new AppError(
            `Validation failed: ${errorMessage}`,
            httpStatusCode.BAD_REQUEST
          )
        );
      } else {
        next(error);
      }
    }
  };
