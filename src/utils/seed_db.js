import roleModel from "../models/roles.js";
import userModel from "../models/users.js";
import bcrypt from "bcrypt";
import { EMAIL_ADMIN, PASS_ADMIN } from "./secret.js";

export default async function () {
  const findDataRole = await roleModel.find({ deleted_at: null });
  const findDataUser = await userModel.find({ deleted_at: null });

  if (!findDataRole.length) {
    let listRole = [{ name: "admin" }, { name: "customer" }];
    await roleModel.insertMany(listRole);
  }

  if (!findDataUser.length) {
    const findRoleAdmin = await roleModel.findOne({
      name: "admin",
      deleted_at: null,
    });

    const passwordHash = bcrypt.hashSync(PASS_ADMIN, 10);

    let dataAdmin = {
      first_name: "Super",
      last_name: "Admin",
      phone: "+6281208120001",
      email: EMAIL_ADMIN,
      password: passwordHash,
      role_id: findRoleAdmin._doc._id, // same like this findRoleAdmin._id
    };

    await userModel.create(dataAdmin);
  }

  return;
}
