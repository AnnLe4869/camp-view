const router = require("express").Router();
const Fuse = require("fuse.js");
const fs = require("fs");

const Campground = require("../../models/campground");
const User = require("../../models/user");
const {
  isSignedIn,
  checkCampgroundOwnership
} = require("../../middleware/index");
const upload = require("../../config/multer");
const { cloudUpload, cloudDestroy } = require("../../config/cloudinary");
const geocoder = require("../../config/google-map");
const unlink = require("util").promisify(fs.unlink);

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

    const newCampground = await Campground.create({
      name,
      image: uploadResult.url,
      imageId: uploadResult.public_id,
      price,
      description,
      location: formattedAddress,
      latitude,
      longitude,
      author: { id: req.user._id, username: req.user.username }
    });

    const { followers } = await User.findById(req.user._id).populate(
      "followers"
    );
    for (const follower of followers) {
      const { notification } = await User.findById(follower).populate(
        "notification"
      );
      notification.campgrounds.push(newCampground._id);
      await notification.save();
    }

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
router.put(
  "/:id",
  checkCampgroundOwnership,
  upload.single("image"),
  async (req, res) => {
    try {
      const { name, description, price, location } = req.body;
      const [{ latitude, longitude }] = await geocoder.geocode(location);
      const [{ formattedAddress }] = await geocoder.reverse({
        lat: latitude,
        lon: longitude
      });
      const uploadResult = await cloudUpload(req.file.path);
      await unlink(`./temp/${req.file.filename}`);

      const campground = await Campground.findByIdAndUpdate(req.params.id, {
        name,
        image: uploadResult.url,
        imageId: uploadResult.public_id,
        price,
        description,
        location: formattedAddress,
        latitude,
        longitude
      });
      await cloudDestroy(campground.imageId);
      res.redirect(`/campgrounds/${req.params.id}`);
    } catch (err) {
      console.log(err);
      req.flash("err", "You are trying to access a nonexistent campground");
      res.redirect("/campgrounds");
    }
  }
);

// REMOVE routes
router.delete("/:id", checkCampgroundOwnership, (req, res) =>
  Campground.findByIdAndDelete(req.params.id)
    .then(async campground => {
      await cloudDestroy(campground.imageId);
      req.flash("success", "You successfully delete a campground");
      res.redirect("/campgrounds");
    })
    .catch(() => {
      req.flash("error", "Something went wrong. Please try again");
      res.redirect("/campgrounds");
    })
);

module.exports = router;
