const router = require("express").Router({ mergeParams: true });
const Notification = require("../../models/notification");
const User = require("../../models/user");
const { isSignedIn } = require("../../middleware/index");

router.get("/notification", isSignedIn, async (req, res) => {
  try {
    const {
      comments: [comment, ...restComments],
      campgrounds: [campground, ...restCampgrounds],
      lastReadAt
    } = await Notification.findOne({
      user: req.user._id
    })
      .populate({
        path: "campgrounds",
        select: "name author.username createdAt",
        options: {
          sort: {
            createdAt: -1
          }
        }
      })
      .populate({
        path: "comments",
        options: {
          sort: {
            createdAt: -1
          }
        }
      });
    const message = (
      // In case the comment or campground is undefined
      comment = {
        author: { username: "" },
        text: "",
        createdAt: 0
      },
      campground = {
        author: { username: "" },
        name: "",
        createdAt: 0
      }
    ) => {
      const returnCases = {
        noNotification: {
          author: "",
          action: "No new notification",
          text: "",
          id: ""
        },
        newComment: {
          author: comment.author.username,
          action: "create a new comment",
          text: comment.text,
          id: comment._id
        },
        newCampground: {
          author: campground.author.username,
          action: "create new campground",
          text: campground.name,
          id: campground._id
        }
      };
      // Check if the post created date newer than the last time notification visit
      if (comment.createdAt > lastReadAt || campground.createdAt > lastReadAt) {
        return comment.createdAt > campground.createdAt
          ? returnCases.newComment
          : returnCases.newCampground;
      } else {
        return returnCases.noNotification;
      }
    };
    res.render("notifications/index", message(comment, campground));
  } catch (err) {
    console.log(err);
    req.flash("error", "Something went wrong. Please try again");
    res.redirect("/campgrounds");
  }
});

module.exports = router;
