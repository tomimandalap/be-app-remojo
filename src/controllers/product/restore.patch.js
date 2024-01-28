import productModel from "../../models/product.js";
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

    const findProductByID = await productModel.findOneAndUpdate(
      { _id, deleted_at: { $ne: null } },
      { deleted_at: null },
      { new: true }
    );

    if (!findProductByID) return message(res, 404, "Product not found");

    message(res, 200, "Restore product success");
  } catch (error) {
    message(res, 500, error?.message || "Internal server error");
  }
}
