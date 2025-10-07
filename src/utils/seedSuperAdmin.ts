import { User } from "../app/modules/users/user.model";
import { configEnv } from "../config/env";
import bycripts from "bcrypt";
import {
  IUser,
  userRole,
  AccountStatus,
} from "../app/modules/users/user.interface";

export const seedSuperAdmin = async () => {
  try {
    const isSuperAdminExist = await User.findOne({
      email: configEnv.Supper_Admin_Email,
    });
    if (isSuperAdminExist) {
      console.log("Super admin already exist");
      return;
    }
    console.log(" Tring to create super admin");

    const hashedPassword = await bycripts.hash(
      configEnv.Password,
      Number(configEnv.BCRYPT_SALT_ROUNDS)
    );

    const payload: IUser = {
      name: "Super Admin",
      email: configEnv.Supper_Admin_Email,
      role: userRole.ADMIN,
      password: hashedPassword,
      status: AccountStatus.ACTIVE,
      isVerified: true,
      isDeleted: false,
    };
    const superAdmin = await User.create(payload);
    console.log("supper admin created successful", superAdmin);
  } catch (error) {
    console.log(error);
  }
};
