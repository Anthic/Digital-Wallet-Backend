import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { router } from "./app/Routers/indexRouter";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler";
import notFoundPageHandler from "./app/middlewares/notFoundPageHandler";
const app = express();

app.use(express.json());

app.use(cors());
app.use("/api/v1", router);

app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader("Content-Type", "application/json");
  next();
});
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Welcome to the Digital-Wallet-Backend ",
  });
});

app.use(globalErrorHandler);

app.use(notFoundPageHandler);
export default app;
