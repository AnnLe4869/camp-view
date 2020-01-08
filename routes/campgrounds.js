const router = require("express").Router();
const NodeGeocoder = require("node-geocoder");
const Fuse = require("fuse.js");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const util = require("util");
const fs = require("fs");
require("dotenv").config();

const Campground = require("../models/campground");
const { isSignedIn, checkCampgroundOwnership } = require("../middleware/index");

/**
 * CONFIGURATION
 */
// Configuration for Google Map
const options = {
  provider: "google",
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
const geocoder = NodeGeocoder(options);
// Configuration for Cloudinary
cloudinary.config({
  cloud_name: "ann4567",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
// Configuration for Multer
const storage = multer.diskStorage({
  filename: (req, file, callback) =>
    callback(null, `${Date.now()}.${file.originalname}`),
  destination: (req, file, callback) => {
    callback(null, "./temp/");
  }
});
const limits = { fileSize: 8 * 1024 * 1024 };
const fileFilter = (req, file, callback) => {
  const acceptedFiles = ["image/jpeg", "image/png", "image/jpg", "image/gif"];
  if (acceptedFiles.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(new Error("Only image is allowed"), false);
  }
};
const upload = multer({ storage, limits, fileFilter });
const cloudUpload = util.promisify(cloudinary.uploader.upload);
const unlink = util.promisify(fs.unlink);
/**
 * ROUTES HANDLER
 */

// Show campground route
router.get("/", async (req, res) => {
  try {
    const campgrounds = await Campground.find({});
    const searchOption = {
      shouldSort: true,
      threshold: 0.6,
      location: 0,
      distance: 10,
      maxPatternLength: 32,
      keys: ["name", "description", "location", "author.username"]
    };
    const fuse = new Fuse(campgrounds, searchOption);
    res.render("campgrounds/index", {
      campGrounds:
        /^\s*$/.test(req.query.search) || !req.query.search
          ? campgrounds
          : fuse.search(req.query.search)
    });
  } catch (err) {
    req.flash("error", "Something went wrong. Please try again");
    res.redirect("/");
  }
});

// NEW - Show form to create new campground
router.get("/new", isSignedIn, (req, res) => {
  res.render("campgrounds/new");
});
// CREATE - Add new campground to database
router.post("/", isSignedIn, upload.single("image"), async (req, res) => {
  try {
    const { name, description, price, location } = req.body;
    const [{ latitude, longitude }] = await geocoder.geocode(location);
    const [{ formattedAddress }] = await geocoder.reverse({
      lat: latitude,
      lon: longitude
    });
    const uploadResult = await cloudUpload(req.file.path);
    await unlink(`./temp/${req.file.filename}`);
    await Campground.create({
      name,
      image: uploadResult.url,
      price,
      description,
      location: formattedAddress,
      latitude,
      longitude,
      author: { id: req.user._id, username: req.user.username }
    });
    req.flash("success", "You have created new campground");
    res.redirect("/campgrounds");
  } catch (err) {
    console.log(err);
    req.flash("error", "Something went wrong. Please try again");
    res.redirect("/campgrounds/new");
  }
});

// SHOW route - Render detailed info about a camp
router.get("/:id", (req, res) => {
  Campground.findById(req.params.id)
    .populate("comments")
    .then(foundCampground => {
      if (!foundCampground) {
        throw new Error();
      }
      res.render("campgrounds/show", {
        campground: foundCampground
      });
    })
    .catch(err => {
      console.error(err);
      req.flash("err", "You are trying to access a nonexistent campground");
      res.redirect("back");
    });
});

// EDIT routes
router.get("/:id/edit", checkCampgroundOwnership, async (req, res) => {
  try {
    const foundCampground = await Campground.findById(req.params.id);
    if (
      req.user._id.toString() == foundCampground.author.id.toString() ||
      req.user.isAdmin
    ) {
      res.render("campgrounds/edit", { campground: foundCampground });
    } else {
      res.redirect("back");
    }
  } catch (err) {
    req.flash("err", "You are trying to access a nonexistent campground");
    res.redirect("back");
  }
});
router.put("/:id", checkCampgroundOwnership, async (req, res) => {
  try {
    const { name, image, description, price, location } = req.body;
    const [{ latitude, longitude }] = await geocoder.geocode(location);
    const [{ formattedAddress }] = await geocoder.reverse({
      lat: latitude,
      lon: longitude
    });
    await Campground.findByIdAndUpdate(req.params.id, {
      name,
      image,
      price,
      description,
      location: formattedAddress,
      latitude,
      longitude
    });
    res.redirect(`/campgrounds/${req.params.id}`);
  } catch (err) {
    console.log(err);
    req.flash("err", "You are trying to access a nonexistent campground");
    res.redirect("/campgrounds");
  }
});

// REMOVE routes
router.delete("/:id", checkCampgroundOwnership, (req, res) =>
  Campground.findByIdAndDelete(req.params.id)
    .then(() => {
      req.flash("success", "You successfully delete a campground");
      res.redirect("/campgrounds");
    })
    .catch(() => {
      req.flash("error", "Something went wrong. Please try again");
      res.redirect("/campgrounds");
    })
);

module.exports = router;
