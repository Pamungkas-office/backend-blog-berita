import multer from "multer";
import { v2 as cloudinary } from 'cloudinary';
import { CustomError } from "./custom-error";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY, 
  api_secret: process.env.CLOUDINARY_SECRET,
});

const storage = multer.memoryStorage();

const fileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new CustomError("Tipe file tidak didukung. Gunakan JPEG, PNG, WebP, atau GIF", 400));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

export const MediaService = {
  async uploadThumbnail(file: Express.Multer.File | undefined): Promise<string | null> {
    if (!file) return null;

    return new Promise<string>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream({
        folder: 'blog_thumbnails'
      }, (err, result) => {
        if (err) return reject(err);
        resolve(result!.secure_url);
      });

      // file.buffer sekarang aman digunakan karena sudah pakai memoryStorage
      stream.end(file.buffer);
    });
  }
};
