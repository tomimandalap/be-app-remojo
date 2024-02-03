import transactionModel from "../../models/transaction.js";
import message from "../../utils/message.js";
import validate from "../../utils/validate.js";

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

    const q = req.query.q || "";
    const page = req.query.page ? Number(req.query.page) : 1;
    const per_page = req.query.per_page ? Number(req.query.per_page) : 10;

    const skip = page > 1 ? (page - 1) * per_page : 0;

    const filters = [
      {
        $match: {
          $and: [
            {
              $or: [
                { order_id: { $regex: q, $options: "i" } },
                { transaction_id: { $regex: q, $options: "i" } },
              ],
            },
            {
              $or: [
                {
                  "rental_duration.start_date": { $lte: new Date(end_date) },
                  "rental_duration.end_date": { $gte: new Date(start_date) },
                },
              ],
            },
          ],
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
    ];

    const data = await transactionModel
      .aggregate(filters)
      .sort({ _id: "desc" })
      .skip(skip)
      .limit(per_page);

    const countDocuments = await transactionModel
      .aggregate(filters)
      .count("total");

    const pagination = {
      page,
      per_page,
      total: countDocuments.length ? countDocuments[0].total : 0,
    };

    message(res, 200, "Data transaction", data, pagination);
  } catch (error) {
    message(res, 500, error?.message || "Internal server error");
  }
}
