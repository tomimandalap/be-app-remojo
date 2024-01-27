import express from "express";
import registerPost from "../controllers/user/register.post.js";
import loginPost from "../controllers/user/login.post.js";
import listGet from "../controllers/user/list.get.js";

const userRoute = express.Router();

userRoute.post("/user/register", registerPost);
userRoute.post("/user/login", loginPost);
userRoute.get("/user", listGet);

export default userRoute;
