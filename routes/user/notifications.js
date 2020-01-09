const router = require("express").Router({ mergeParams: true });
const Campground = require("../../models/campground");
const User = require("../../models/user");
const Comment = require("../../models/comment");
const { isSignedIn } = require("../../middleware/index");

router.get("/", isSignedIn, async (req, res) => {
  const campgrounds = Campground.find({
    author: req.user._id
  });
  res.render("notifications/index");
});
