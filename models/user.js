const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String },
  email: { type: String, required: true },
  followers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],
  following: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],
  notification: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Notification"
  },
  avatar: String,
  avatarId: String,
  firstName: String,
  lastName: String,
  isAdmin: {
    type: Boolean,
    default: false
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date
});
userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", userSchema);
