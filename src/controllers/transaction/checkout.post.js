import transactionModel from "../../models/transaction.js";
import userModel from "../../models/users.js";
import productModel from "../../models/product.js";

import validate from "../../utils/validate.js";
import message from "../../utils/message.js";
import midtransClient from "midtrans-client";

import { z } from "zod";
import { Types } from "mongoose";
import { nanoid } from "nanoid";
import {
  MIDTRANS_CLIENT_KEY,
  MIDTRANS_SERVER_KEY,
} from "../../utils/secret.js";

const schemaValidation = z.object({
  rental_duration: z.object({
    start_date: z.coerce.date(),
    end_date: z.coerce.date(),
  }),
  user_id: z
    .string()
    .refine((value) => Types.ObjectId.isValid(value), "User ID invalid"),
  product_ids: z
    .array(
      z
        .string()
        .refine((value) => Types.ObjectId.isValid(value), "Product ID invalid")
    )
    .refine((value) => value.length, "Product id is required"),
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

    // FIND USER BY ID
    const findUserID = await userModel.findOne({
      _id: checkValidate.data.user_id,
      deleted_at: null,
    });

    if (!findUserID) return message(res, 404, "User not found");

    // FIND PRODUCT BY IDs
    const findProductID = await productModel.find({
      _id: { $in: checkValidate.data.product_ids },
    });

    if (!findProductID.length) return message(res, 404, "Product not found");

    if (findProductID.length !== checkValidate.data.product_ids.length)
      return message(res, 400, "Some products were not found");

    let item_details = findProductID.map((product) => {
      return {
        id: product._doc._id,
        name: product._doc.name,
        price: product._doc.price,
        quantity: 1,
        merchant_name: "REMOJO",
        category: "MOBIL",
      };
    });

    // a = accumulatior and b original value
    const gross_amount = item_details.reduce((a, b) => a + b.price, 0);

    const order_id = `REMOJO-${nanoid(8)}-${nanoid(6)}`;
    let parameter = {
      transaction_details: {
        order_id,
        gross_amount,
      },
      customer_details: {
        first_name: findUserID._doc.first_name,
        last_name: findUserID._doc.last_name,
        email: findUserID._doc.email,
        phone: findUserID._doc.phone,
      },
      item_details,
    };

    // SNAP MIDTRANS CLIENT
    let snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: MIDTRANS_SERVER_KEY,
      clientKey: MIDTRANS_CLIENT_KEY,
    });

    snap
      .createTransaction(parameter)
      .then(async (response) => {
        const payload = {
          ...parameter.transaction_details,
          ...checkValidate.data,
          token: response.token,
          redirect_url: response.redirect_url,
        };

        await transactionModel.create(payload);

        message(res, 201, "Checkout success", response);
      })
      .catch((error) => {
        const { error_messages: errors } = error.ApiResponse;
        message(res, 500, "Midtrans", {
          errors,
        });
      });
  } catch (error) {
    message(res, 500, error?.message || "Internal server error");
  }
}
