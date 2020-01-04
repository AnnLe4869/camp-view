const Campground = require("../models/campground");
const Comment = require("../models/comment");

function isSignedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    req.flash("error", "You need to log in to continue");
    return res.redirect(`/login`);
  }
}

function checkCampgroundOwnership(req, res, next) {
  if (req.isAuthenticated()) {
    Campground.findById(req.params.id)
      .then(foundCampground => {
        if (
          req.user._id.toString() == foundCampground.author.id.toString() ||
          req.user.isAdmin
        ) {
          return next();
        } else {
          req.flash("error", "You don't have permission to do this");
          res.redirect("back");
        }
      })
      .catch(err => {
        console.error(err);
        req.flash("error", "You are trying to edit a nonexistent campground");
        res.redirect("back");
      });
  } else {
    req.flash("error", "You need to log in to continue");
    res.redirect("back");
  }
}

function checkCommentOwnership(req, res, next) {
  if (req.isAuthenticated()) {
    Comment.findById(req.params.commentId)
      .then(foundComment => {
        if (
          foundComment.author.id.toString() === req.user._id.toString() ||
          req.user.isAdmin
        ) {
          next();
        } else {
          req.flash("error", "You don't have permission to do this");
          return res.redirect("back");
        }
      })
      .catch(() => {
        res.redirect("back");
        req.flash("error", "You are trying to edit a nonexistent comment");
      });
  } else {
    req.flash("error", "You need to log in to continue");
    return res.redirect("/login");
  }
}

module.exports = {
  checkCampgroundOwnership,
  isSignedIn,
  checkCommentOwnership
};
