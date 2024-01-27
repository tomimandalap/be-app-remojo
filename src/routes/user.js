import express from "express";
import registerPost from "../controllers/user/register.post.js";

const userRoute = express.Router();

userRoute.post("/user/register", registerPost);

export default userRoute;
