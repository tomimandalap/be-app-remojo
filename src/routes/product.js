import express from "express";
import Create from "../controllers/product/create.post.js";
import All from "../controllers/product/all.get.js";
import Detail from "../controllers/product/detail.get.js";
import Restore from "../controllers/product/restore.patch.js";
import Remove from "../controllers/product/remove.delete.js";

import UploadImg from "../middleware/uploadImg.js";
import { authentication, admin } from "../middleware/auth.js";

const productRoute = express.Router();

productRoute.post("/product/new", authentication, admin, UploadImg, Create);
productRoute.get("/product", authentication, admin, All);
productRoute.get("/product/:_id", authentication, admin, Detail);
productRoute.patch("/product/restore/:_id", authentication, admin, Restore);
productRoute.delete("/product/remove/:_id", authentication, admin, Remove);

export default productRoute;
