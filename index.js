import express from "express";
import cors from "cors";
import SeedDB from "./src/utils/seed_db.js";
import userRoute from "./src/routes/user.js";
import productRoute from "./src/routes/product.js";
import transactionRoute from "./src/routes/transaction.js";

import { PORT } from "./src/utils/secret.js";

import "./src/config/connection.js";
import "./src/config/cloudinary.js";

const app = express();

// DEFINE CORS
app.use(cors());

// DEFINE BODY PARSER
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// DEFINE ROUTE
app.use("/api/v1", [userRoute, productRoute, transactionRoute]);

// RUN SEEDING DB
await SeedDB();
app.listen(PORT, () =>
  console.log(`service running on http://localhost:${PORT}`)
);
