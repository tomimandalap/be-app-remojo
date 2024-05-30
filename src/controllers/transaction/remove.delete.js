import transactionModel from "../../models/transaction.js";
import message from '../../utils/message.js';

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
    const order_id = req.params.order_id

    const findTransaction = await transactionModel.findOneAndDelete({
      order_id,
      deleted_at: null,
    });

    if (!findTransaction) return  message(res, 404, 'Transaction not found');

    message(res, 200, 'Remove transaction success', findTransaction);
  } catch (error) {
    message(res, 500, error?.message || "Internal server error");
  }
}