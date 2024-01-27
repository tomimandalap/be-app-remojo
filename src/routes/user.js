import express from "express";
import Register from "../controllers/user/register.post.js";
import Login from "../controllers/user/login.post.js";
import List from "../controllers/user/list.get.js";
import Detail from "../controllers/user/detail.get.js";
import Updated from "../controllers/user/update.put.js";
import Restored from "../controllers/user/restore.patch.js";
import Removed from "../controllers/user/remove.delete.js";

const userRoute = express.Router();

userRoute.post("/user/register", Register);
userRoute.post("/user/login", Login);
userRoute.get("/user", List);
userRoute.get("/user/:_id", Detail);
userRoute.put("/user/:_id", Updated);
userRoute.patch("/user/restore/:_id", Restored);
userRoute.delete("/user/remove/:_id", Removed);

export default userRoute;
