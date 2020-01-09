const router = require("express").Router();
const User = require("../../models/user");
const Campground = require("../../models/campground");
const Notification = require("../user/notifications");
const passport = require("passport");
const fs = require("fs");

require("dotenv").config();

const upload = require("../../config/multer");
const { cloudUpload } = require("../../config/cloudinary");
const unlink = require("util").promisify(fs.unlink);

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
  const newNotification = await Notification.create({});
  User.register(
    new User({
      username,
      firstName,
      lastName,
      email,
      notification: newNotification._id,
      avatar: uploadResult.url,
      avatarId: uploadResult.public_id,
      isAdmin: adminCode === process.env.ADMIN_CODE
    }),
    password,
    (err, user) => {
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

// Password reset
router.use("/", require("./password-reset"));
// Subscribe
router.use("/", require("./subscribe"));

module.exports = router;
