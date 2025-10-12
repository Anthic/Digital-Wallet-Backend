import httpstatuscode from "http-status-codes";
import { Request, Response } from "express";

const notFoundPageHandler = (req: Request, res: Response) => {
  res.status(httpstatuscode.NOT_FOUND).json({
    status: false,
    message: "Not Found",
  });
};

export default notFoundPageHandler;
