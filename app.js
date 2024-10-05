require("dotenv").config();

const express = require("express");
const expressLayout = require("express-ejs-layouts");

const connectDB = require("./server/config/db");

const app = express();
const PORT = process.env.PORT || 3000; //process.env.PORT should be first arg as its a truthy value evaluation, otherwise it shouldnt consider it

connectDB();
app.use(express.static("public"));
//Template engine setup
app.use(expressLayout);
app.set("layout", "./layouts/main");
app.set("view engine", "ejs");

app.use("/", require("./server/routes/main"));

app.listen(3000, () => {
  console.log(`APP started listening on port ${PORT}`);
});
