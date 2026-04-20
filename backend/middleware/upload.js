import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

// Ensure cloudinary is configured (depends on dotenv in server.js loading first)
// Will warn/fail gracefully if env vars are extremely broken, but ideally it expects CLOUDINARY_CLOUD_NAME etc.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "hydrosphere-listings",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    // transformation: [{ width: 1000, crop: "limit" }] // optional automatic resizing
  },
});

const upload = multer({ storage: storage });

export { upload, cloudinary };
