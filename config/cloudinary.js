const cloudinary = require("cloudinary").v2;
const util = require("util");

require("dotenv").config();

cloudinary.config({
  cloud_name: "ann4567",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const cloudUpload = util.promisify(cloudinary.uploader.upload);
const cloudDestroy = util.promisify(cloudinary.uploader.destroy);

module.exports = { cloudUpload, cloudDestroy };
