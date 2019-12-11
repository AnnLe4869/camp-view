const express = require("express"),
  mongoose = require("mongoose"),
  chalk = require("chalk"),
  morgan = require("morgan"),
  session = require("express-session"),
  passport = require("passport"),
  LocalStrategy = require("passport-local").Strategy,
  methodOverride = require("method-override"),
  flash = require("connect-flash"),
  helmet = require("helmet");

//const seedDB = require("./seed");
const User = require("./models/user");
const authRoute = require("./routes/index");
const commentRoute = require("./routes/comments");
const campgroundRoute = require("./routes/campgrounds");
//seedDB();
const app = express();
app.set("view engine", "ejs");
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
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
app.use((req, res, next) => {
  res.locals.user = req.user;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  return next();
});
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

(async () => {
  try {
    mongoose.connect(
      "mongodb+srv://yelp-user:23456789@yelpcamp-wlmtx.mongodb.net/yelp-camp?retryWrites=true&w=majority",
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
  console.log(chalk.green("The YelpCamp server has started"))
);
