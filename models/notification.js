const mongoose = require("mongoose");
const notificationSchema = new mongoose.Schema({
  newComment: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment"
    }
  ],
  newCampground: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campground"
    }
  ],
  newSubscriber: [
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
