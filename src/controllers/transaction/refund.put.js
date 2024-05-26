import transactionModel from "../../models/transaction.js";
import message from "../../utils/message.js";
import validate from "../../utils/validate.js";

import { z } from "zod";

const schemaValidation = z.object({
  note_refund: z
    .string()
    .min(10, "Input must have at least 10 letters")
    .max(50, "Input must not exceed 50 characters"),
});
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
    const body = req.body;

    // CHECK VALIDATION FORM BODY
    const checkValidate = validate(schemaValidation, body);
    if (!checkValidate.success)
      return message(res, 422, "Error validation", {
        errors: checkValidate.errors,
      });

    const _id = req.params._id;

    const findTransaction = await transactionModel.findOne({
      _id,
      status: { $eq: "success" },
      deleted_at: null,
    });

    if (!findTransaction) return message(res, 404, "Transaction not found");

    const { start_date } = findTransaction._doc.rental_duration;
    const today = new Date();
    const timeDifference = start_date.getTime() - today.getTime();
    const hoursDifference = timeDifference / (1000 * 60 * 60);
    const isBefore24Hours = hoursDifference >= 24;

    if (!isBefore24Hours)
      return message(
        res,
        400,
        "Sorry, a refund cannot be processed as the rental period has already commenced."
      );

    const detail = await transactionModel.findOneAndUpdate(
      { _id },
      { ...checkValidate.data, status: "refund", refund_date: new Date() },
      { new: true }
    );

    message(res, 200, "Refund success", detail);
  } catch (error) {
    message(res, 500, error?.message || "Internal server error");
  }
}
