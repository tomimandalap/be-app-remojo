import express from "express";
import Create from "../controllers/product/create.post.js";
import All from "../controllers/product/all.get.js";
import UploadImg from "../middleware/uploadImg.js";

import { authentication, admin } from "../middleware/auth.js";

const productRoute = express.Router();

productRoute.post("/product/new", authentication, admin, UploadImg, Create);
productRoute.get("/product", authentication, admin, All);

export default productRoute;
