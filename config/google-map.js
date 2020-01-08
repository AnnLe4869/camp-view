const NodeGeocoder = require("node-geocoder");
require("dotenv").config();

const options = {
  provider: "google",
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
const geocoder = NodeGeocoder(options);

module.exports = geocoder;
