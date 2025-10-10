import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { userRole } from "../users/user.interface";
import { WalletController } from "./wallet.controller";

const router = Router();

router.get(
  "/my-wallet",
  checkAuth(userRole.USER, userRole.AGENT),
  WalletController.getMyWallet
);

router.get("/all", checkAuth(userRole.ADMIN), WalletController.getAllWallets);

router.patch(
  "/block/:walletId",
  checkAuth(userRole.ADMIN),
  WalletController.blockWallet
);

router.patch(
  "/unblock/:walletId",
  checkAuth(userRole.ADMIN),
  WalletController.unblockWallet
);

export const WalletRouter = router;
