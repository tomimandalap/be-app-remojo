import transactionModel from "../../models/transaction.js";
import message from "../../utils/message.js";

import midtransClient from "midtrans-client";

import { MIDTRANS_SERVER_KEY, MIDTRANS_CLIENT_KEY } from "../../utils/secret.js";


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
    const order_id = req.params.order_id;

    const findTransaction = await transactionModel.findOne({
      order_id,
      deleted_at: null,
    });

    if (!findTransaction) return message(res, 404, "Transaction not found");

    // SNAP MIDTRANS CLIENT
    let snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: MIDTRANS_SERVER_KEY,
      clientKey: MIDTRANS_CLIENT_KEY,
    });

    const response = await snap.transaction.status(order_id); // can used order_id or transaction_id from findTransaction

    const {
      status_message,
      transaction_id,
      transaction_status,
      fraud_status,
    } = response;

    let status = "";

    if (transaction_status == "capture") {
      if (fraud_status == "challenge") {
        status = "challenge";
      } else if (fraud_status == "accept") {
        status = "success";
      }
    } else if (transaction_status == "settlement") {
      status = "success";
    } else if (["cancel", "deny", "expire"].includes(transaction_status)) {
      status = "failure";
    } else if (transaction_status == "pending") {
      status = "pending";
    } else if (transaction_status == "refund") {
      status = "refund";
    }

    const payload = {
      transaction_id,
      status,
    };

    const detailTransaction = await transactionModel.findOneAndUpdate(
      { order_id },
      payload,
      { new: true }
    );

    return message(res, 200, status_message, detailTransaction);
  } catch (error) {
    let resError = error

    if (resError && resError.ApiResponse) {
      let {status_code, status_message} = error.ApiResponse
      return message(res, Number(status_code), status_message);
    }

    message(res, 500, error?.message || "Internal server error");
  }
}