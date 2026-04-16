import multer from "multer";
import path from "path";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";

dotenv.config();

// Configure Cloudinary if keys are present
if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// Fallback to local storage if Cloudinary is not configured
const localStore = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const cloudinaryStore = process.env.CLOUDINARY_CLOUD_NAME 
  ? new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
        folder: "verdant-attachments",
        allowed_formats: ["jpg", "png", "pdf", "docx", "txt"],
      } as any,
    })
  : null;

const upload = multer({ 
  storage: cloudinaryStore || localStore,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

export default upload;
