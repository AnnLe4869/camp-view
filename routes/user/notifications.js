const router = require("express").Router({ mergeParams: true });
const Notification = require("../../models/notification");
const User = require("../../models/user");
const { isSignedIn } = require("../../middleware/index");

router.get("/notification", isSignedIn, async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      {
        user: req.user._id
      },
      { lastReadAt: Date.now() }
    );
  } catch (err) {
    console.log(err);
    req.flash("error", "Something went wrong. Please try again");
    res.redirect("/campgrounds");
  }
});

module.exports = router;
