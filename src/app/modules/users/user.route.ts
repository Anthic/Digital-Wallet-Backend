import { Router } from "express";
import { UserController } from "./user.controller";
import { createUserValidationSchema } from "./user.zodvalidation";
import { validationUser } from "../../middlewares/zodValidator";
import { userRole } from "./user.interface";
import { checkAuth } from "../../middlewares/checkAuth";
import { AdminController } from "../admin/admin.controller";

const router = Router();

router.post(
  "/register",
  validationUser(createUserValidationSchema),
  UserController.createUser
);
router.get(
  "/admin/all-users",
  checkAuth(userRole.ADMIN),
  AdminController.getAllUsers
);

router.get(
  "/admin/all-wallets",
  checkAuth(userRole.ADMIN),
  AdminController.getAllWallets
);

router.patch(
  "/admin/wallet/:walletId/toggle-status",
  checkAuth(userRole.ADMIN),
  AdminController.toggleWalletStatus
);

router.patch(
  "/admin/agent/:agentId/toggle-status",
  checkAuth(userRole.ADMIN),
  AdminController.toggleAgentStatus
);

export const UserRouter = router;
