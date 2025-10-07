import { Router } from "express";
import { UserRouter } from "../modules/users/user.route";

export const router = Router();

const moduleRouters = [
  {
    path: "/users",
    route: UserRouter,
  },
];
moduleRouters.map((route) => {
  router.use(route.path, route.route);
});
