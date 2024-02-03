import productModel from "../../../models/product.js";
import message from "../../../utils/message.js";
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

    const detail = await productModel.aggregate([
      {
        $match: {
          _id: new Types.ObjectId(_id),
          deleted_at: null,
        },
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
        $unwind: "$detail_storage",
      },
    ]);

    if (!detail.length) return message(res, 404, "Product not found");

    message(res, 200, "Detail product", detail[0]);
  } catch (error) {
    message(res, 500, error?.message || "Internal server error");
  }
}
