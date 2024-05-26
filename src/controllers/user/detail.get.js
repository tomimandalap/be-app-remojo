import userModel from "../../models/users.js";
import message from "../../utils/message.js";
import { Types } from "mongoose";

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

    const data = await userModel.aggregate([
      {
        $lookup: {
          from: "roles",
          foreignField: "_id",
          localField: "role_id",
          as: "detail_role",
        },
      },
      {
        $unwind: "$detail_role",
      },
      {
        $lookup: {
          from: "storages",
          foreignField: "_id",
          localField: "storage_id",
          as: "detail_storage",
        },
      },
      {
        $unwind: {
          path: "$detail_storage",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          detail_storage: {
            $ifNull: ["$detail_storage", null],
          },
        },
      },
      {
        $project: {
          password: 0,
        },
      },
      {
        $match: {
          _id: new Types.ObjectId(_id),
          "detail_role.name": "customer",
        },
      },
    ]);

    if (!data.length) return message(res, 404, "Data user not found");

    message(res, 200, "Detail user", data[0]);
  } catch (error) {
    message(res, 500, error?.message || "Internal server error");
  }
}
