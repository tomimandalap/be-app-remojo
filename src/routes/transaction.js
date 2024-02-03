import express from "express";
import Checkout from "../controllers/transaction/checkout.post.js";
import List from "../controllers/transaction/list.get.js";

import { authentication, customer } from "../middleware/auth.js";

const transactionRoute = express.Router();

transactionRoute.post(
  "/transaction/checkout",
  authentication,
  customer,
  Checkout
);
transactionRoute.get("/transaction", authentication, List);

export default transactionRoute;
