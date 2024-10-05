const express = require("express");
const router = express.Router();

router.get("", (req, res) => {
  const local = {
    title: "nodejs blog",
    description: " this is blog created using node js",
  };

  res.render("index", { local });
});

module.exports = router;
