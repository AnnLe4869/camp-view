const router = require("express").Router();
const Campground = require("../models/campground");
const { isSignedIn, checkCampgroundOwnership } = require("../middleware/index");

// Show campground route
router.get("/", (req, res) => {
  Campground.find({})
    .then(campGrounds => res.render("campgrounds/index", { campGrounds }))
    .catch(err => console.error(err));
});

// NEW - Show form to create new campground
router.get("/new", isSignedIn, (req, res) => {
  res.render("campgrounds/new");
});
// CREATE - Add new campground to database
router.post("/", isSignedIn, (req, res) => {
  const { name, image, description, price } = req.body;
  Campground.create({
    name,
    image,
    price,
    description,
    author: { id: req.user._id, username: req.user.username }
  })
    .then(() => {
      req.flash("success", "You have created new campground");
      res.redirect("/campgrounds");
    })
    .catch(() => {
      req.flash("error", "Something went wrong. Please try again");
      res.redirect("/campgrounds/new");
    });
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
router.get("/:id/edit", checkCampgroundOwnership, (req, res) => {
  Campground.findById(req.params.id)
    .then(foundCampground => {
      if (req.user._id.toString() == foundCampground.author.id.toString()) {
        res.render("campgrounds/edit", { campground: foundCampground });
      } else {
        res.redirect("back");
      }
    })
    .catch(() => {
      req.flash("err", "You are trying to access a nonexistent campground");
      res.redirect("back");
    });
});
router.put("/:id", checkCampgroundOwnership, (req, res) => {
  const { name, image, description, price } = req.body;
  Campground.findByIdAndUpdate(req.params.id, {
    name,
    image,
    price,
    description
  })
    .then(() => res.redirect(`/campgrounds/${req.params.id}`))
    .catch(() => {
      req.flash("err", "You are trying to access a nonexistent campground");
      res.redirect("/campgrounds");
    });
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
