const mongoose = require("mongoose");
const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment"
    }
  ],
  campgrounds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campground"
    }
  ],
  followers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],
  lastReadAt: {
    type: Date,
    default: Date.now()
  }
});

module.exports = mongoose.model("Notification", notificationSchema);
