import express from "express";
import cors from "cors";
import SeedDB from "./src/utils/seed_db.js";
import userRoute from "./src/routes/user.js";

import { PORT } from "./src/utils/secret.js";

import "./src/config/connection.js";
import "./src/config/cloudinary.js";

const app = express();

// DEFINE CORS
app.use(cors());

// DEFINE BODY PARSER
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1", userRoute);

await SeedDB();
app.listen(PORT, () =>
  console.log(`service running on http://localhost:${PORT}`)
);
