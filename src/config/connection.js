import mongoose from "mongoose";
import { URL_MONGODB } from "../utils/secret.js";

try {
  await mongoose.connect(URL_MONGODB, { autoIndex: true, });
  console.log("DB connection success");
} catch (error) {
  console.error.error("DB connection failed", error);
}
