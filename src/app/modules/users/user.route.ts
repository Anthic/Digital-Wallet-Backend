import { Router } from "express";
import { UserController } from "./user.controller";
import { createUserValidationSchema } from "./user.zodvalidation";
import { validationUser } from "../../middlewares/zodValidator";

const router = Router();

router.post("/register", validationUser(createUserValidationSchema),  UserController.createUser);



export const UserRouter = router;
