const multer = require("multer");

const storage = multer.diskStorage({
  filename: (req, file, callback) =>
    callback(null, `${Date.now()}.${file.originalname}`),
  destination: (req, file, callback) => {
    callback(null, "./temp/");
  }
});
const limits = { fileSize: 10 * 1024 * 1024 };
const fileFilter = (req, file, callback) => {
  const acceptedFiles = ["image/jpeg", "image/png", "image/jpg", "image/gif"];
  if (acceptedFiles.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(new Error("Only image is allowed"), false);
  }
};
const upload = multer({ storage, limits, fileFilter });

module.exports = upload;
