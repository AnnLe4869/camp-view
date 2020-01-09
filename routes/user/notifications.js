const router = require("express").Router({ mergeParams: true });
const Notification = require("../../models/notification");
const User = require("../../models/user");
const { isSignedIn } = require("../../middleware/index");

router.get("/campgrounds/notification", isSignedIn, async (req, res) => {
  try {
    // const users = await User.find();
    // for (const user of users) {
    //   if (user.notification === undefined) {
    //     const notification = await Notification.create({
    //       lastReadAt: Date.now()
    //     });
    //     notification.user = user._id;
    //     user.notification = notification._id;
    //     await user.save();
    //     await notification.save();
    //   }
    // }
    const notifications = await Notification.findOne({
      user: req.user._id
    })
      .populate({
        path: "comments"
      })
      .populate({
        path: "campgrounds",
        select: "author.username name createdAt"
      });
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
