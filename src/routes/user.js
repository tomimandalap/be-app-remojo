import express from "express";
import Register from "../controllers/user/register.post.js";
import Login from "../controllers/user/login.post.js";
import List from "../controllers/user/list.get.js";
import Detail from "../controllers/user/detail.get.js";
import Updated from "../controllers/user/update.put.js";
import Restored from "../controllers/user/restore.patch.js";
import Removed from "../controllers/user/remove.delete.js";

import {
  authentication,
  admin,
  validateUserID,
  customer,
} from "../middleware/auth.js";
import UploadImg from "../middleware/uploadImg.js";

const userRoute = express.Router();

userRoute.post("/user/register", Register);
userRoute.post("/user/login", Login);
userRoute.get("/user", authentication, admin, List);
userRoute.get("/user/:_id", authentication, Detail);
userRoute.put(
  "/user/:_id",
  authentication,
  customer,
  validateUserID,
  UploadImg,
  Updated
);
userRoute.patch("/user/restore/:_id", authentication, admin, Restored);
userRoute.delete("/user/remove/:_id", authentication, admin, Removed);

export default userRoute;
