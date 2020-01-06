const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String },
  avatar: String,
  firstName: String,
  lastName: String,
  email: String,
  isAdmin: {
    type: Boolean,
    default: false
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date
});
userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", userSchema);
