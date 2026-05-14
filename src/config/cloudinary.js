const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    let folder = "learning-vibe/misc";
    let resource_type = "auto";
    if (file.mimetype.startsWith("image/")) {
      folder = "learning-vibe/images";
      resource_type = "image";
    } else if (file.mimetype.startsWith("video/")) {
      folder = "learning-vibe/videos";
      resource_type = "video";
    } else {
      folder = "learning-vibe/docs";
      resource_type = "raw";
    }
    return { folder, resource_type };
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

module.exports = { cloudinary, upload };
