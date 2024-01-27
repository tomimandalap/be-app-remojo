import userModel from "../../models/users.js";
import storageModel from "../../models/storage.js";
import message from "../../utils/message.js";
import validate from "../../utils/validate.js";
import cloudinary from "cloudinary";

import { Types } from "mongoose";
import { z } from "zod";

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
    // CHECK VALIDATION FORM BODY
    const body = req.body;
    const checkValidate = validate(schemaValidation, body);
    if (!checkValidate.success)
      return message(res, 422, "Error validation", {
        errors: checkValidate.errors,
      });

    // CHECK USER BY ID
    const _id = req.params._id;
    const findUserByID = await userModel.findOne({
      _id: new Types.ObjectId(_id),
      deleted_at: null,
    });

    if (!findUserByID) return message(res, 404, "User not found");

    let payload = {};
    if (file) {
      // FIND DATA IMG ON STORAGE BY STORAGE_ID
      const storage_id = findUserByID._doc.storage_id;
      const findImgByStorageID = await storageModel.findById({
        _id: storage_id,
      });

      // DELETE IMG ON CLOUDINARY AND STORAGE
      if (findImgByStorageID) {
        await cloudinary.v2.uploader.destroy(findImgByStorageID._doc.public_id);
        await storageModel.deleteOne({ _id: storage_id });
      }

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

      // ASSIGNT STORAGE_ID FORM RESPONSE CREATE STORAGE
      payload.storage_id = createStorege._doc._id;
    }

    const updateUser = await userModel.findByIdAndUpdate(
      { _id, deleted_at: null },
      { ...payload, ...checkValidate.data },
      { new: true }
    );

    message(res, 200, "Update user success", updateUser);
  } catch (error) {
    message(res, 500, error?.message || "Internal server error");
  } finally {
    if (file && file.buffer) file.buffer = undefined;
  }
}
