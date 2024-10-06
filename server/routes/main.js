const express = require("express");
const router = express.Router();
const { postModel } = require("../models/post");

router.get("", async (req, res) => {
  try {
    const local = {
      title: "nodejs blog",
      description: " this is blog created using node js",
    };

    let perPage = 10;
    let page = req.query.page || 1;
    const data = await postModel
      .aggregate([{ $sort: { createdAt: -1 } }])
      .skip(perPage * page - perPage)
      .limit(perPage)
      .exec();
    const count = await postModel.countDocuments();
    const nextPage = parseInt(page) + 1;
    const hasNextPage = nextPage <= Math.ceil(count / perPage);

    res.render("index", {
      local,
      data,
      current: page,
      nextPage: hasNextPage ? nextPage : null,
      currentRoute: "/",
    });
  } catch (err) {
    console.log(err);
  }
});

router.get("/post/:id", async (req, res) => {
  try {
    const local = {
      title: " Post contents",
      description: " simple Blog created with node js , express & mongo DB",
    };

    let postId = req.params.id;
    const data = await postModel.findById({ _id: postId });
    res.render("post", { local, data, currentRoute: `/post/${postId}` });
  } catch (err) {
    console.log(err);
  }
});

router.post("/search", async (req, res) => {
  try {
    const local = {
      title: "search",
    };
    let searchTerm = req.body.searchTerm;
    const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9]/g, "");
    const data = await postModel.find({
      $or: [
        { title: { $regex: new RegExp(searchNoSpecialChar, "i") } },
        { body: { $regex: new RegExp(searchNoSpecialChar, "i") } },
      ],
    });
    res.render("search", {
      local,
      data,
    });
  } catch (err) {
    console.log(err);
  }
});

router.get("/about", (req, res) => {
  res.render("about", { currentRoute: "/about" });
});

module.exports = router;
