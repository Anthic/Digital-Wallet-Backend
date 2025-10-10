import { Request, Response, NextFunction } from "express";
import { ZodTypeAny, ZodError } from "zod";
import { catchAsync } from "../../utils/catchAsync";
import AppError from "../errorHelper/appError";
import httpStatusCode from "http-status-codes";

export const zodValidatorTransaction = (schema: ZodTypeAny) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    try {
     
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
       
        const errorMessages = error.issues.map(issue => {
          const path = issue.path.slice(1).join("."); 
          return `${path}: ${issue.message}`;
        }).join(", ");

        throw new AppError(
          `Validation Error: ${errorMessages}`,
          httpStatusCode.BAD_REQUEST
        );
      }
      
      throw error;
    }
  });
};