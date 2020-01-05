const router = require("express").Router();
const User = require("../models/user");
const Campground = require("../models/campground");
const passport = require("passport");
require("dotenv").config();

// Root route
router.get("/", (req, res) => {
  res.render("landing");
});

// Sign up routes
router.get("/register", (req, res) => res.render("users/register"));
router.post("/register", (req, res) => {
  const { username, firstName, lastName, avatar, email, adminCode } = req.body;
  User.register(
    new User({
      username,
      firstName,
      lastName,
      avatar,
      email,
      isAdmin: adminCode === process.env.ADMIN_CODE
    }),
    req.body.password,
    (err, user) => {
      console.log(user);
      if (err) {
        req.flash("error", err.message);
        return res.redirect("/register");
      }
      passport.authenticate("local")(req, res, () => {
        req.flash("success", "Welcome to YelpCamp " + user.username);
        res.redirect("/campgrounds");
      });
    }
  );
});

// Sign in routes
router.get("/login", (req, res) => res.render("users/login"));
router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: "Username or password is wrong or did not exist",
    successRedirect: "/campgrounds"
  })
);

// Sign out route
router.get("/logout", (req, res) => {
  req.flash("success", "Logged you out");
  req.logout();
  res.redirect("/campgrounds");
});

router.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      req.flash("error", "User is not existed");
      return res.redirect("back");
    }
    const campgrounds = await Campground.find({
      author: {
        id: user._id,
        username: user.username
      }
    });
    res.render("users/show", { user, campgrounds });
  } catch (err) {
    req.flash("error", "Something went wrong");
    return res.redirect("back");
  }
});

module.exports = router;
