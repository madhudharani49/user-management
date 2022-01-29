const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const authRoute = require("./routes/auth");
const userRoute = require("./routes/user");
const app = express();

dotenv.config();

const url = process.env.MONGO_URL;
app.use(express.json());
mongoose
  .connect(url)
  .then(() => console.log("Database connected successfully"))
  .catch((err) => console.log(err));
app.use("/api/auth", authRoute);
app.use("/api/user", userRoute);
app.listen(5000, () => console.log("server running on 5000 port"));
