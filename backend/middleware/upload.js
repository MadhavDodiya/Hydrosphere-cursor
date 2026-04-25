import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

// Ensure cloudinary is configured (depends on dotenv in server.js loading first)
// Will warn/fail gracefully if env vars are extremely broken, but ideally it expects CLOUDINARY_CLOUD_NAME etc.
const isCloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET;

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
} else {
  console.warn("⚠️ Cloudinary credentials missing. Image uploads will fail.");
}

const storage = isCloudinaryConfigured 
  ? new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
        folder: "hydrosphere-listings",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
      },
    })
  : multer.memoryStorage(); // Fallback to memory storage (won't persist but won't crash)

const upload = multer({ storage: storage });

export { upload, cloudinary };
