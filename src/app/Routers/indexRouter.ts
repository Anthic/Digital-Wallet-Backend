import { Router } from "express";
import { UserRouter } from "../modules/users/user.route";
import { AuthRouter } from "../modules/auth/auth.route";
import { WalletRouter } from "../modules/wallet/router";
import { TransactionsRouter } from "../modules/transaction/transaction.route";

export const router = Router();

const moduleRouters = [
  {
    path: "/auth",
    route: AuthRouter,
  },
  {
    path: "/users",
    route: UserRouter,
  },
  {
    path: "/wallets",
    route: WalletRouter,
  },
  {
    path: "/transactions",
    route: TransactionsRouter,
  },
];
moduleRouters.map((route) => {
  router.use(route.path, route.route);
});
