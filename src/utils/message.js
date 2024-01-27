/**
 * @typedef {import('express').Response} ExpressResponse
 */

/**
 * @param {ExpressResponse} res
 */

export default function (res, code, message, data, pagination) {
  res.status(code).send({
    code,
    message,
    data,
    pagination,
  });
}
