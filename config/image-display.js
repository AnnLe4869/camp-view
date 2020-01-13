const Jimp = require("jimp");
module.exports = async function(imageURL, imageID) {
  try {
    const img = await Jimp.read(imageURL);
    img.resize(Jimp.AUTO, 400).write(`temp/scaled-${imageID}.jpg`);
    return `temp/scaled-${imageID}.jpg`;
  } catch (error) {
    throw new Error(error);
  }
};
