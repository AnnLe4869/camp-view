const router = require("express").Router({ mergeParams: true });
const Campground = require("../../models/campground");
const User = require("../../models/user");
const Comment = require("../../models/comment");
const { isSignedIn } = require("../../middleware/index");

router.post("/:authorId/subscribe", isSignedIn, async (req, res) => {
  try {
    const campAuthor = await User.findById(req.params.authorId);
    const user = await User.findById(req.user._id);
    if (campAuthor._id.toString() === req.user._id.toString()) {
      req.flash("error", `You can't subscribe to yourself`);
      return res.redirect(`back`);
    }
    campAuthor.followers.push(user._id);
    user.following.push(campAuthor._id);
    await campAuthor.save();
    await user.save();
    req.flash("success", `You subscribed to ${campAuthor.username}`);
    res.redirect(`/users/${req.params.authorId}`);
  } catch (err) {
    console.log(err);
    req.flash("error", "Something went wrong. Please try again");
    res.redirect("/campgrounds");
  }
});

module.exports = router;
