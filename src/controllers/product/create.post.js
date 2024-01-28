import productModel from "../../models/product.js";
import storageModel from "../../models/storage.js";
import message from "../../utils/message.js";
import validate from "../../utils/validate.js";
import cloudinary from "cloudinary";

import { z } from "zod";

const schemaValidation = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(50, 'Name must not exceed 50 characters"')
    .trim(),
  price: z.number().int().positive(),
  description: z
    .string()
    .min(10, "Description must have at least 10 letters")
    .max(350, "Description must not exceed 350 characters")
    .trim(),
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
  const file = req.file;
  try {
    const body = req.body;
    const checkValidate = validate(schemaValidation, {
      ...body,
      price: Number(body.price),
    });

    // CHECK VALIDATION FORM BODY
    if (!checkValidate.success)
      return message(res, 422, "Error validation", {
        errors: checkValidate.errors,
      });

    // CHECK VALIDATION FORM FILE
    if (!file)
      return message(res, 422, "Error validation", {
        errors: [{ path: "image", message: "Image is required" }],
      });

    // UPLOAD IMG ON CLOUDINARY
    const uploadResult = await new Promise((resolve) => {
      cloudinary.v2.uploader
        .upload_stream((error, uploadResult) => {
          return resolve(uploadResult);
        })
        .end(file.buffer);
    });

    // CREATE DOCUMENT ON STORAGE
    const createStorege = await storageModel.create({
      public_id: uploadResult.public_id,
      secure_url: uploadResult.secure_url,
    });

    // CREATE DOCUMENT ON PRODUCT
    let payload = {
      ...checkValidate.data,
      storage_id: createStorege._doc._id, // same value like createStorege._id
    };

    await productModel.create(payload);

    message(res, 201, "Create product success");
  } catch (error) {
    message(res, 500, error?.message || "Internal server error");
  } finally {
    if (file && file.buffer) file.buffer = undefined;
  }
}
