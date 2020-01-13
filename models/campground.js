const mongoose = require("mongoose");
const { cloudUpload, cloudDestroy } = require("../config/cloudinary");
const createScaledImage = require("../config/image-display");
const unlink = require("util").promisify(require("fs").unlink);

const campgroundSchema = new mongoose.Schema({
  name: String,
  image: String,
  imageId: String,
  scaledImage: String,
  scaledImageId: String,
  description: String,
  price: String,
  location: String,
  longitude: Number,
  latitude: Number,
  views: [{ type: Date }],
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now()
  },
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    username: String
  },
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment"
    }
  ]
});

campgroundSchema.pre("save", async next => {
  try {
    if (this.isNew || this.isModified("image")) {
      const scaledImageTempPath = await createScaledImage(this.image);
      const scaledImageUploadResult = await cloudUpload(scaledImageTempPath);
      this.scaledImage = scaledImageUploadResult.url;
      this.scaledImageId = scaledImageUploadResult.public_id;
      console.log("Scaled image temporary path is" + scaledImageTempPath);
      await unlink(`${scaledImageTempPath}`);
    }

    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model("Campground", campgroundSchema);
