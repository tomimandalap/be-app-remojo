import transactionModel from "../../models/transaction.js";
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

    const detail = await transactionModel.aggregate([
      {
        $match: {
          _id: new Types.ObjectId(_id),
          deleted_at: null,
        },
      },
      {
        $lookup: {
          from: "users",
          foreignField: "_id",
          localField: "user_id",
          as: "detail_user",
        },
      },
      {
        $unwind: "$detail_user",
      },
      {
        $lookup: {
          from: "products",
          foreignField: "_id",
          localField: "product_ids",
          as: "detail_product",
        },
      },
      {
        $project: {
          "detail_user.password": 0,
        },
      },
    ]);

    if (!detail.length) return message(res, 404, "Transaction not found");

    message(res, 200, "Detail transaction", detail[0]);
  } catch (error) {
    message(res, 500, error?.message || "Internal server error");
  }
}
