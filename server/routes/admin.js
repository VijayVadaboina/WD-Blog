const express = require("express");
const router = express.Router();
const { postModel } = require("../models/post");
const { userModel } = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const jwtsecret = process.env.JWT_SECRET;

const adminLayout = "../views/layouts/admin";

const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    res.status(401).json({ message: " unauthorized" });
  }
  try {
    const decoded = jwt.verify(token, jwtsecret);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ message: " unauthorized" });
  }
};

router.get("/admin", async (req, res) => {
  try {
    const local = { title: "NodeJS Blog" };
    res.render("admin/index", { local, layout: adminLayout });
  } catch (err) {
    console.log(err);
  }
});
// to check login
router.post("/admin", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await userModel.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid creds" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: " invalid creds" });
    }
    const token = jwt.sign({ userId: user._id }, jwtsecret);
    res.cookie("token", token, { httponly: true });
    res.redirect("/dashboard");
  } catch (err) {
    console.log(err);
  }
});

router.get("/dashboard", authMiddleware, async (req, res) => {
  try {
    const local = { title: "Node JS Blog" };

    const data = await postModel.find();
    res.render("admin/dashboard", { local, data, layout: adminLayout });
  } catch (err) {
    console.log(err);
  }
});

router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
      const user = await userModel.create({
        username,
        password: hashedPassword,
      });
      res.status(201).json({ message: "User Created  :" + user });
    } catch (err) {
      if (err.code === 11000) {
        res.status(409).json({ message: " User already in use" });
      }
      res.status(500).json({ message: " Internal server error " + err });
    }
  } catch (err) {
    console.log(err);
  }
});

router.get("/add-post", authMiddleware, async (req, res) => {
  try {
    const local = { title: "add post" };

    res.render("admin/add-post", { local, layout: adminLayout });
  } catch (err) {
    console.log(err);
  }
});

router.post("/add-post", authMiddleware, async (req, res) => {
  try {
    try {
      const { title, body } = req.body;
      await postModel.create({
        title,
        body,
      });
      res.redirect("/dashboard");
    } catch (err) {
      console.log(err);
    }

    res.render("admin/add-post", { layout: adminLayout });
  } catch (err) {
    console.log(err);
  }
});

router.get("/edit-post/:id", authMiddleware, async (req, res) => {
  try {
    const local = { title: " editing the post" };
    const data = await postModel.findOne({ _id: req.params.id });

    res.render("admin/edit-post", {
      data,
      layout: adminLayout,
      local,
    });
  } catch (err) {
    console.log(err);
  }
});

router.put("/edit-post/:id", authMiddleware, async (req, res) => {
  try {
    await postModel.findByIdAndUpdate(req.params.id, {
      title: req.body.title,
      body: req.body.body,
      updatedAt: Date.now(),
    });
    res.redirect(`/edit-post/${req.params.id}`);
  } catch (err) {
    console.log(err);
  }
});

router.delete("/delete-post/:id", authMiddleware, async (req, res) => {
  try {
    await postModel.deleteOne({ _id: req.params.id });
    res.redirect("/dashboard");
  } catch (err) {
    console.log(err);
  }
});

router.get("/logout", (req, res) => {
  res.clearCookie("token");
  //res.json({ message: "Logout Successful" });
  res.redirect("/");
});
module.exports = router;
