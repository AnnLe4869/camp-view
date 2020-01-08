const router = require("express").Router();
const crypto = require("crypto");
const sgMail = require("@sendgrid/mail");
const User = require("../models/user");
const Campground = require("../models/campground");
const passport = require("passport");
const fs = require("fs");

require("dotenv").config();

const upload = require("../config/multer");
const { cloudUpload } = require("../config/cloudinary");
const unlink = require("util").promisify(fs.unlink);

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Root route
router.get("/", (req, res) => {
  res.render("landing");
});

// Sign up routes
router.get("/register", (req, res) => res.render("users/register"));
router.post("/register", upload.single("avatar"), async (req, res) => {
  const {
    username,
    firstName,
    lastName,
    email,
    adminCode,
    password
  } = req.body;
  const uploadResult = await cloudUpload(req.file.path);
  await unlink(`./temp/${req.file.filename}`);

  User.register(
    new User({
      username,
      firstName,
      lastName,
      avatar: uploadResult.url,
      avatarId: uploadResult.public_id,
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
  res.render("users/forgot");
});
router.post("/forgot", async (req, res) => {
  try {
    const token = crypto.randomBytes(50).toString("hex");

    const foundUser = await User.findOneAndUpdate(
      {
        email: req.body.email
      },
      {
        resetPasswordToken: token,
        resetPasswordExpire: Date.now() + 15 * 60 * 1000
      }
    );
    if (!foundUser) {
      req.flash("error", "No account with that email address exists.");
      return res.redirect("/forgot");
    }

    // Send email to user
    await sgMail.send({
      to: req.body.email,
      from: "nadom45981@mailon.ws",
      subject: "Node.js Password Reset",
      html: ` <p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p>
        <p>Please click on the following link, or paste this into your browser to complete the process: </p>
        <p>http://${req.headers.host}/reset/${token} </p>
        <p>The link will expire in 15 minutes </p>
        <p>If you did not request this, please ignore this email and your password will remain unchanged. </p>`
    });
    // Display flash message if success
    req.flash("success", `An email has been sent to ${req.body.email}`);
    return res.redirect("/forgot");
  } catch (err) {
    req.flash("error", "Something went wrong");
    return res.redirect("/forgot");
  }
});

// Show reset password form
router.get("/reset/:token", async (req, res) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpire: {
        $gt: Date.now()
      }
    });
    if (!user) {
      req.flash("error", "Password reset token is invalid or has expired.");
      return res.redirect("/forgot");
    }
    res.render("users/reset", { token: req.params.token });
  } catch (err) {
    req.flash("error", "Something went wrong");
    return res.redirect("/forgot");
  }
});
router.post("/reset/:token", async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      {
        resetPasswordToken: req.params.token,
        resetPasswordExpire: {
          $gt: Date.now()
        }
      },
      {
        resetPasswordToken: null,
        resetPasswordExpire: null
      },
      { new: true }
    );
    if (!user) {
      req.flash("error", "Password reset token is invalid or has expired.");
      return res.redirect("/forgot");
    }
    if (req.body.password === req.body.confirm) {
      await user.setPassword(req.body.password);
      await user.save();
    } else {
      res.redirect(`/reset/${req.params.token}`);
    }
    await sgMail.send({
      to: user.email,
      from: "nadom45981@mailon.ws",
      subject: "Successfully Password Reset",
      html: ` <p>Your password have been reset successfully</p>
        <p>If you didn't change the password, please go to the website to authenticate again.
           <strong> Someone may have steal your account </strong>
        </p>
        <p>Please click on the following link, or paste this into your browser to go back to the website</p>
        <p>http://${req.headers.host}/campgrounds </p> `
    });
    return res.redirect("/login");
  } catch (err) {
    req.flash("error", "Something went wrong");
    return res.redirect("/forgot");
  }
});

module.exports = router;
