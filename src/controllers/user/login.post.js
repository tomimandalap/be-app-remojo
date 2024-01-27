import bcrypt from "bcrypt";
import userModel from "../../models/users.js";
import validate from "../../utils/validate.js";
import message from "../../utils/message.js";
import jwt from "jsonwebtoken";

import { SECRET_KEY } from "../../utils/secret.js";
import { z } from "zod";

const schemaValidation = z.object({
  email: z
    .string()
    .email("Invalid phone number format. Please enter a valid phone number"),
  password: z
    .string()
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Password strength insufficient. Please choose a stronger password that includes a combination of uppercase and lowercase letters, numbers, and special characters"
    ),
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

    const findUserbyEmail = await userModel.aggregate([
      {
        $match: {
          email: checkValidate.data.email,
          deleted_at: null,
        },
      },
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
    ]);

    // CHECK USER BY EMAIL IF NOT REGISTERED ON DB
    if (!findUserbyEmail.length)
      return message(res, 400, "Email not registered");

    // DEFINE DETAIL USER
    const detailUser = findUserbyEmail[0];

    // COMPARE PASSWORD
    const isPassword = bcrypt.compareSync(
      checkValidate.data.password,
      detailUser.password
    );

    // CHECK PASSWORD
    if (!isPassword)
      return message(
        res,
        400,
        "Invalid password. Please double-check your password and try again"
      );

    // GENERATE USER TOKEN
    const token = jwt.sign(
      { role_name: detailUser.detail_role.name },
      SECRET_KEY,
      { expiresIn: "2h" }
    );

    message(res, 200, "Login success", { token, type: "Bearer" });
  } catch (error) {
    message(res, 500, error?.message || "Internal server error");
  }
}
