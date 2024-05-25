import transactionModel from "../../models/transaction.js";
import message from "../../utils/message.js";
import mongoose from "mongoose"

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

    const data = await transactionModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(_id),
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
          as: "products",
        },
      },
      {
        $lookup: {
          from: "storages",
          foreignField: "_id",
          localField: "products.storage_id",
          as: "image_storages",
        },
      },
      {
        $project: {
          "detail_user.password": 0,
        },
      },
    ]);

    if (!data.length) return message(res, 404, "Transaction not found");

     let detail = data.map((item) => {
      let products = item.products.map((sub_item) => {
        let image_detail = item.image_storages.find((image) => {
          let image_id = new mongoose.Types.ObjectId(image._id).toString()
          let storage_id = new mongoose.Types.ObjectId(sub_item.storage_id).toString()
          return image_id === storage_id;
        })

        return {
          ...sub_item,
          image_detail
        }
      });      

      delete item.image_storages;
      
      return {
        ...item,
        products
      }
    })

    message(res, 200, "Detail transaction", detail[0]);
  } catch (error) {
    message(res, 500, error?.message || "Internal server error");
  }
}
