import bcrypt from "bcrypt";
import userModel from "../../models/users.js";
import roleModel from "../../models/roles.js";
import message from "../../utils/message.js";
import validate from "../../utils/validate.js";
import jwt from "jsonwebtoken";

import { z } from "zod";
import { SECRET_KEY } from "../../utils/secret.js";

const schemaValidation = z.object({
  first_name: z
    .string()
    .min(1, "First name is required")
    .max(20, "First name must not exceed 20 characters")
    .trim(),
  last_name: z.string().trim(),
  phone: z
    .string()
    .regex(
      /^(\+62|62)?[\s-]?0?8[1-9]{1}\d{1}[\s-]?\d{4}[\s-]?\d{2,5}$/,
      "Invalid phone number format. Please enter a valid phone number"
    ),
  email: z.string().email("Invalid email format"),
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

    const findUserbyEmail = await userModel.findOne({
      email: checkValidate.data.email,
      deleted_at: null,
    });

    // CHECK EMAIL ON SYSTEM
    if (findUserbyEmail) return message(res, 400, "Email has been registered");

    const findRoleCustomer = await roleModel.findOne({
      name: "customer",
      deleted_at: null,
    });

    // HASH PASSWORD USE BCRYPT
    const passwordHash = bcrypt.hashSync(checkValidate.data.password, 10);

    const newUser = {
      ...checkValidate.data,
      password: passwordHash,
      role_id: findRoleCustomer._doc._id, // same value like this findRoleCustomer._id
    };

    await userModel.create(newUser);

    // CREATE USER TOKEN
    const token = jwt.sign(
      { role_name: findRoleCustomer._doc.name },
      SECRET_KEY,
      {
        expiresIn: "120",
      }
    );

    message(res, 201, "Register user success", {
      token,
      type: "Bearer",
    });
  } catch (error) {
    message(res, 500, error?.message || "Internal server error");
  }
}
