import { NextFunction, Request, Response } from "express";
import { ZodObject, ZodError, ZodIssue, ZodRawShape } from "zod";
import AppError from "../errorHelper/appError";
import httpStatusCode from "http-status-codes";

export const validationUser =
  <T extends ZodRawShape>(zodSchema: ZodObject<T>) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await zodSchema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.issues.map((err: ZodIssue) => {
          const baseError = {
            field: err.path.join(".") || "unknown",
            message: err.message,
          };

          if (err.code === "invalid_type") {
            const invalidTypeErr = err as ZodIssue & {
              received: string;
              expected: string;
            };
            return {
              ...baseError,
              received: invalidTypeErr.received,
              expected: invalidTypeErr.expected,
            };
          }

          return baseError;
        });

        const errorMessage = formattedErrors
          .map((err) => `${err.field}: ${err.message}`)
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