import userModel from "../../models/users.js";
import message from "../../utils/message.js";

/**
 * @typedef {import('express').Request} ExpressRequest
 * @typedef {import('express').Response} ExpressResponse
 */

/**
 * @param {ExpressRequest} req
 * @param {ExpressResponse} res
 */

export default async function (req, res) {
  try {
    const _id = req.params._id;

    const findUserByID = await userModel.findOneAndUpdate(
      {
        _id,
        deleted_at: { $ne: null },
      },
      { deleted_at: null },
      { new: true }
    );

    if (!findUserByID) return message(res, 404, "User not found");

    message(res, 200, "Restore user success");
  } catch (error) {
    message(res, 500, error?.message || "Internal server error");
  }
}
