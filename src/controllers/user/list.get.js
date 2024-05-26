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
    const q = req.query.q || "";
    const sort_by = req.query.sort_by ? req.query.sort_by : "desc"; // mongoose 1 = asc or -1 desc
    const page = req.query.page ? Number(req.query.page) : 1;
    const per_page = req.query.per_page ? Number(req.query.per_page) : 10;

    const skip = page > 1 ? (page - 1) * per_page : 0;

    const filters = [
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
          $or: [
            { first_name: { $regex: q, $options: "i" } },
            { last_name: { $regex: q, $options: "i" } },
            { email: { $regex: q, $options: "i" } },
            { phone: { $regex: q, $options: "i" } },
          ],
          "detail_role.name": "customer",
        },
      },
    ];

    const data = await userModel
      .aggregate(filters)
      .sort({ _id: sort_by }) // mongoose 1 = asc or -1 desc
      .skip(skip)
      .limit(per_page);

    const countDocuments = await userModel.aggregate(filters).count("total");
    const pagination = {
      page,
      per_page,
      total: countDocuments.length ? countDocuments[0].total : 0,
    };

    message(res, 200, "Data user", data, pagination);
  } catch (error) {
    message(res, 500, error?.message || "Internal server error");
  }
}
