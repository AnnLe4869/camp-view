const router = require("express").Router({ mergeParams: true });
const Notification = require("../../models/notification");
const User = require("../../models/user");
const { isSignedIn } = require("../../middleware/index");

router.get("/campgrounds/notification", isSignedIn, async (req, res) => {
  try {
    const notifications = await Notification.findOne({
      user: req.user._id
    })
      .populate({
        path: "campgrounds",
        select: "name author.username image createdAt"
      })
      .populate({ path: "comments" });
    console.log(notifications);
    res.redirect("/campgrounds");
    //res.render("notifications/index");
  } catch (err) {
    console.log(err);
    req.flash("error", "Something went wrong. Please try again");
    res.redirect("/campgrounds");
  }
});

module.exports = router;
