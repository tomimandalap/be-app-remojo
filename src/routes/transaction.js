import express from "express";
import Checkout from "../controllers/transaction/checkout.post.js";

import { authentication, customer } from "../middleware/auth.js";

const transactionRoute = express.Router();

transactionRoute.post(
  "/transaction/checkout",
  authentication,
  customer,
  Checkout
);

export default transactionRoute;
