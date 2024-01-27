import express from "express";
import cors from "cors";
import "./src/config/connection.js";

import { PORT } from "./src/utils/secret.js";

const app = express();

// DEFINE CORS
app.use(cors());

app.get("/", (req, res) => {
  res.status(200).send({
    message: "Hello world",
    data: [1, 2, 3, 4],
  });
});

app.listen(PORT, () =>
  console.log(`service running on http://localhost:${PORT}`)
);
