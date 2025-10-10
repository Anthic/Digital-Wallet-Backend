import { Router } from "express";
import { AuthController } from "./auth.controller";
import { userRole } from "../users/user.interface";
import { checkAuth } from "../../middlewares/checkAuth";

const router = Router();

router.post("/login", AuthController.credentialLogin);
router.post("/refresh-token", AuthController.getNewAccessToken);
router.post("/logout", AuthController.logout);
router.post(
  "/reset-password",
  checkAuth(...Object.values(userRole)),
  AuthController.resetPassword
);

export const AuthRouter = router;
