import productModel from "../../../models/product.js";
import transactionModel from "../../../models/transaction.js";
import message from "../../../utils/message.js";

import validate from "../../../utils/validate.js";
import { z } from "zod";

const schemaValidation = z
  .object({
    start_date: z.coerce.date(),
    end_date: z.coerce.date(),
  })
  .refine((data) => {
    return !data.end_date || data.start_date <= data.end_date;
  }, "start_date must not be greater than end_date");

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
    const start_date = req.query.start_date;
    const end_date = req.query.end_date;

    // CHECK VALIDATION FORM QUERY
    const checkValidate = validate(schemaValidation, req.query);

    if (!checkValidate.success)
      return message(res, 422, "Error validation", {
        errors: checkValidate.errors,
      });

    const findTransaction = await transactionModel.find({
      $or: [
        {
          "rental_duration.start_date": { $lte: new Date(end_date) },
          "rental_duration.end_date": { $gte: new Date(start_date) },
        },
      ],
      status: { $nin: ["failure", "refund"] },
      deleted_at: null,
    });

    let product_ids = findTransaction
      .map((transaction) => transaction._doc.product_ids)
      .flat();

    const q = req.query.q || "";
    const page = req.query.page ? Number(req.query.page) : 1;
    const per_page = req.query.per_page ? Number(req.query.per_page) : 10;

    const skip = page > 1 ? (page - 1) * per_page : 0;

    const filters = [
      {
        $match: {
          name: { $regex: q, $options: "i" },
          _id: { $nin: product_ids },
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
