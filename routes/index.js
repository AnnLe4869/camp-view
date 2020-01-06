const router = require("express").Router();
const crypto = require("crypto");
const sgMail = require("@sendgrid/mail");
const User = require("../models/user");
const Campground = require("../models/campground");
const passport = require("passport");
require("dotenv").config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Root route
router.get("/", (req, res) => {
  res.render("landing");
});

// Sign up routes
router.get("/register", (req, res) => res.render("users/register"));
router.post("/register", (req, res) => {
  const {
    username,
    firstName,
    lastName,
    avatar,
    email,
    adminCode,
    password
  } = req.body;
  User.register(
    new User({
      username,
      firstName,
      lastName,
      avatar,
      email,
      isAdmin: adminCode === process.env.ADMIN_CODE
    }),
    password,
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

// User profile route
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
    res.render("users/show", { currentUser: user, campgrounds });
  } catch (err) {
    req.flash("error", "Something went wrong");
    return res.redirect("back");
  }
});

// Get password reset
router.get("/forgot", (req, res) => {
  const msg = {
    to: "kunquan2345@gmail.com",
    from: "nadom45981@mailon.ws",
    subject: "Sending with Twilio SendGrid is Fun",
    text: "and easy to do anywhere, even with Node.js",
    html: "<strong>and easy to do anywhere, even with Node.js</strong>"
  };
  sgMail.send(msg);
  res.render("users/forgot");
});
router.post("/forgot", async (req, res) => {
  try {
    const foundUser = await User.findOne({
      email: req.body.email
    });
    if (!foundUser) {
      req.flash("error", "No account with that email address exists.");
      return res.redirect("/forgot");
    }

    // Create user token
    const token = crypto.randomBytes(50).toString("hex");
    foundUser.resetPasswordToken = token;
    foundUser.resetPasswordExpire = Date.now() + 3600000;
    await foundUser.save();

    // Send email to user

    // Display flash message if success
    req.flash("success", `An email has been sent to ${req.body.email}`);
    res.redirect("/forgot");
  } catch (err) {
    req.flash("error", "Something went wrong");
    return res.redirect("/forgot");
  }
});

module.exports = router;
