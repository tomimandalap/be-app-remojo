import roleModel from "../models/roles.js";

export default async function () {
  const findDataRole = await roleModel.find({ deleted_at: null });

  if (!findDataRole.length) {
    let listRole = [{ name: "admin" }, { name: "customer" }];
    await roleModel.insertMany(listRole);
  }

  return;
}
