const router = require("express").Router({ mergeParams: true });
const Campground = require("../../models/campground");
const Comment = require("../../models/comment");
const { isSignedIn, checkCommentOwnership } = require("../../middleware/index");

// Create comment form
router.get("/new", isSignedIn, (req, res) => {
  Campground.findById(req.params.id)
    .then(campground => {
      res.render("comments/new", { campground });
    })
    .catch(() => {
      req.flash("err", "You are trying to access a nonexistent campground");
      res.redirect("back");
    });
});

// Create comment
router.post("/", isSignedIn, async (req, res) => {
  try {
    const campground = await Campground.findById(req.params.id);
    const comment = await Comment.create(req.body.comment);
    // We can just simply assign new value to the variable
    // If we deal with literal object we need to use Object.assign(), which in detail include array and normal object
    comment.author.id = req.user._id;
    comment.author.username = req.user.username;
    // save comment
    await comment.save();
    campground.comments.push(comment);
    // save campground
    await campground.save();
    req.flash("success", "You have created a new comment");
    res.redirect(`/campgrounds/${req.params.id}`);
  } catch (err) {
    req.flash("error", "Something went wrong");
    res.redirect("back");
  }
});

// Edit comment
router.get("/:commentId/edit", checkCommentOwnership, (req, res) =>
  Comment.findById(req.params.commentId)
    .then(foundComment => {
      res.render("comments/edit", {
        comment: foundComment,
        campgroundId: req.params.id
      });
    })
    .catch(() => {
      req.flash("err", "You are trying to access a nonexistent comment");
      res.redirect("back");
    })
);
router.put("/:commentId", checkCommentOwnership, (req, res) => {
  Comment.findByIdAndUpdate(req.params.commentId, req.body.comment)
    .then(() => res.redirect(`/campgrounds/${req.params.id}`))
    .then(() => {
      req.flash("err", "You are trying to access a nonexistent comment");
      res.redirect("back");
    });
});

// Delete comment
router.delete("/:commentId", checkCommentOwnership, (req, res) =>
  Comment.findByIdAndDelete(req.params.commentId)
    .then(() => {
      req.flash("success", "You successfully delete a comment");
      res.redirect(`/campgrounds/${req.params.id}`);
    })
    .catch(() => {
      req.flash("err", "Something went wrong. Please try again");
      res.redirect("back");
    })
);
module.exports = router;
