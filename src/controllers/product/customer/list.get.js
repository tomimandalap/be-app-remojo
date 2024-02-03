import productModel from "../../../models/product.js";
import message from "../../../utils/message.js";

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
    const q = req.query.q || "";
    const page = req.query.page ? Number(req.query.page) : 1;
    const per_page = req.query.per_page ? Number(req.query.per_page) : 10;

    const skip = page > 1 ? (page - 1) * per_page : 0;

    const filters = [
      {
        $match: {
          name: { $regex: q, $options: "i" },
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
    ];

    const data = await productModel
      .aggregate(filters)
      .sort({ _id: "desc" })
      .skip(skip)
      .limit(per_page);

    const countDocuments = await productModel.aggregate(filters).count("total");

    const pagination = {
      page,
      per_page,
      total: countDocuments.length ? countDocuments[0].total : 0,
    };

    message(res, 200, "Data product", data, pagination);
  } catch (error) {
    message(res, 500, error?.message || "Internal server error");
  }
}
