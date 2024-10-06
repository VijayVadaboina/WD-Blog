require("dotenv").config();

const express = require("express");
const expressLayout = require("express-ejs-layouts");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const MongoStore = require("connect-mongo");

const connectDB = require("./server/config/db");
const { Store } = require("express-session");

const app = express();
const PORT = process.env.PORT || 3000; //process.env.PORT should be first arg as its a truthy value evaluation, otherwise it shouldnt consider it

connectDB();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    secret: "hello vijay",
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
    }),
    //cookie:{ maxAge: new Date((Date.now() + (3600000)))}
  })
);
app.use(express.static("public"));

//Template engine setup
app.use(expressLayout);
app.set("layout", "./layouts/main");
app.set("view engine", "ejs");

app.use("/", require("./server/routes/main"));
app.use("/", require("./server/routes/admin"));

app.listen(3000, () => {
  console.log(`APP started listening on port ${PORT}`);
});
