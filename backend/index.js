// index.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/api", (req, res) => {
  res.send("Backend is running!");
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
