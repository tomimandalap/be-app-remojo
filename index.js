import express from "express";

const PORT = 3001;
const app = express();

app.get("/", (req, res) => {
  res.status(200).send({
    message: "Hello world",
    data: [1, 2, 3, 4],
  });
});

app.listen(PORT, () =>
  console.log(`service running on http://localhost:${PORT}`)
);
