const router = require("express").Router({ mergeParams: true });
const Notification = require("../../models/notification");
const User = require("../../models/user");
const { isSignedIn } = require("../../middleware/index");

// router.get("/notification", isSignedIn, async (req, res) => {
//   res.render("notifications/index");
// });

module.exports = router;
