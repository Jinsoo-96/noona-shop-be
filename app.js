const express = require("express");
const mongoose = require("mongoose");
const bodParser = require("body-parser");
const cors = require("cors");
const indexRouter = require("./routes/index");
const app = express();

require("dotenv").config();
app.use(cors());
app.use(bodParser.urlencoded({ extended: false }));
app.use(bodParser.json()); // req.body가 객체로 인식이 됩니다.

app.use("/api", indexRouter);
// /api/user

const mongoURI = process.env.LOCAL_DB_ADDRESS;
mongoose
  .connect(mongoURI, { useNewUrlParser: true })
  .then(() => console.log("mongoose connected"))
  .catch((err) => console.log("DB connection fail", err));

app.listen(process.env.PORT || 9999, () => console.log("server on"));
