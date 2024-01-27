import jwt from "jsonwebtoken";
import userModel from "../models/users.js";
import message from "../utils/message.js";

import { SECRET_KEY } from "../utils/secret.js";

/**
 * @typedef {import('express').Request} ExpressRequest
 * @typedef {import('express').Response} ExpressResponse
 * @typedef {import('express').NextFunction} ExpressNext
 */

/**
 * @param {ExpressRequest} req
 * @param {ExpressResponse} res
 * @param {ExpressNext} next
 */

export function authentication(req, res, next) {
  const authorization = req.headers["authorization"];

  if (!authorization)
    return message(res, 401, "Authorization header is required");

  const token = authorization.replace("Bearer ", "");

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      const { name, message: msg } = err;

      const isTokenInvalid = name === "JsonWebTokenError";
      const isTokenExpired = name === "TokenExpiredError";

      const resultMessage = isTokenInvalid
        ? "Token invalid signature"
        : isTokenExpired
        ? "Token expired"
        : msg;

      return message(res, 403, resultMessage);
    }

    // assign data decode in response
    res.decoded = {
      user_id: decoded.user_id,
      role_name: decoded.role_name,
    };

    next();
  });
}

/**
 * AUTHORIZATION ADMIN
 */
export function admin(req, res, next) {
  const { role_name } = res.decoded;
  if (role_name === "customer") return message(res, 403, "Forbiden access");

  next();
}

/**
 * AUTHORIZATION CUSTOMER
 */
export function customer(req, res, next) {
  const { role_name } = res.decoded;
  if (role_name === "admin") return message(res, 403, "Forbiden access");

  next();
}

/**
 * AUTHORIZATION CHECK USER BY ID
 */

export function validateUserID(req, res, next) {
  const { user_id } = res.decoded;
  const _id = req.params._id;

  if (user_id !== _id) return message(res, 403, "Forbiden access");

  next();
}
