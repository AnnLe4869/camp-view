const router = require("express").Router({ mergeParams: true });
const Campground = require("../../models/campground");
const User = require("../../models/user");
const { isSignedIn } = require("../../middleware/index");

router.post("/", isSignedIn, async (req, res) => {
  try {
    const currentCampground = await Campground.findById(req.params.id);
    const user = await User.findById(req.user._id);
    // Reject if user try to like himself
    if (currentCampground.author.id.toString() === req.user._id.toString()) {
      req.flash("err", "You cannot like your own campground");
      return res.redirect("/campgrounds");
    }
    // Check if user already like the campground
    // If yes, unlike it
    const isUserAlreadyLiked =
      currentCampground.likes.filter(likedUser => likedUser.equals(user._id))
        .length > 0;
    if (isUserAlreadyLiked) {
      await currentCampground.likes.pull(req.user._id);
      req.flash("success", "Remove from liked campgrounds");
    } else {
      currentCampground.likes.push(user);
      req.flash("success", "Added to liked campgrounds");
    }

    await currentCampground.save();
    res.redirect(`/campgrounds/${req.params.id}`);
  } catch (err) {
    console.error(err);
    req.flash("err", "Something went wrong");
    res.redirect("/campgrounds");
  }
});

module.exports = router;
