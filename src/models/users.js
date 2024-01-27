import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    first_name: {
      type: String,
      required: true,
    },
    last_name: {
      type: String,
      default: null,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role_id: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Roles", // relation collection users to roles
    },
    storage_id: {
      type: Schema.Types.ObjectId,
      ref: "Storages", // relation collection users to storages
      default: null,
    },
    deleted_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

const userModel = model("Users", userSchema);

export default userModel;
