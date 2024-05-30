import transactionModel from "../../models/transaction.js";
import message from "../../utils/message.js";

import { MIDTRANS_URL_API, MIDTRANS_SERVER_KEY } from "../../utils/secret.js";

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

    const url = `${MIDTRANS_URL_API}/v2/${order_id}/status`;
    const token = btoa(MIDTRANS_SERVER_KEY + ":");
    const response = await fetchData(url, token);

    const {
      status_code,
      status_message,
      transaction_id,
      transaction_status,
      fraud_status,
    } = response;

    // SUCCESS
    if ([200, 201].includes(Number(status_code))) {
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
    }

    // TRANSACTION DOES"T EXIST
    if ([404].includes(Number(status_code)))
      return message(
        res,
        Number(status_code),
        `${status_message} Please check your transaction`
      );

    // TRANSACTION DOES"T EXIST
    if ([407].includes(Number(status_code)))
      return message(
        res,
        400,
        status_message
      );

    message(res, Number(status_code), status_message);
  } catch (error) {
    message(res, 500, error?.message || "Internal server error");
  }
}

async function fetchData(url = "", token = undefined) {
  // Default options are marked with *
  const response = await fetch(url, {
    method: "GET", // *GET, POST, PUT, DELETE, etc.
    mode: "cors", // no-cors, *cors, same-origin
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    credentials: "same-origin", // include, *same-origin, omit
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Basic ${token}`,
    },
    redirect: "follow", // manual, *follow, error
    referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
  });
  return response.json(); // parses JSON response into native JavaScript objects
}
