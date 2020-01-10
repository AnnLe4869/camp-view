const express = require("express"),
  mongoose = require("mongoose"),
  session = require("express-session"),
  passport = require("passport"),
  LocalStrategy = require("passport-local").Strategy,
  methodOverride = require("method-override"),
  flash = require("connect-flash"),
  moment = require("moment"),
  helmet = require("helmet");
require("dotenv").config();

const app = express();
if (process.env.NODE_ENV) {
  const morgan = require("morgan");
  app.use(morgan("dev"));
}
//const seedDB = require("./seed");
const User = require("./models/user");
const Notification = require("./models/notification");
const authRoute = require("./routes/user/index");
const commentRoute = require("./routes/comment/comments");
const campgroundRoute = require("./routes/campground/campgrounds");
app.set("view engine", "ejs");
app.locals.moment = moment;

app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/temp"));
app.use(flash());
app.use(helmet());

app.use(methodOverride("_method"));
app.use(
  session({
    resave: false,
    secret: "this is the secret",
    saveUninitialized: false,
    cookie: {
      maxAge: 10 * 60 * 1000,
      httpOnly: true,
      sameSite: true
    }
  })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
app.use(async (req, res, next) => {
  res.locals.user = req.user;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  if (req.user) {
    try {
      const { comments, campgrounds, lastReadAt } = await Notification.findOne({
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
      const allMessages = [
        ...comments.map(comment => {
          comment.type = "comment";
          return comment;
        }),
        ...campgrounds.map(campground => {
          campground.type = "campground";
          return campground;
        })
      ].sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));
      res.locals.newMessages = allMessages.filter(
        post => post.createdAt > lastReadAt
      );
      res.locals.oldMessages = allMessages.filter(
        post => post.createdAt < lastReadAt
      );
    } catch (err) {
      console.error(err);
    }
  }
  return next();
});
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

(async () => {
  try {
    mongoose.connect(
      process.env.DATABASE_PROD_URL || process.env.DATABASE_DEV_URL,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true
      }
    );
    mongoose.connection.on("error", err => console.error(err));
    app.use("/", authRoute);
    app.use("/campgrounds", campgroundRoute);
    app.use("/campgrounds/:id/comments", commentRoute);
  } catch (err) {
    console.error(err);
  }
})();

app.listen(process.env.PORT || 3000, () =>
  console.log("The YelpCamp server has started")
);
