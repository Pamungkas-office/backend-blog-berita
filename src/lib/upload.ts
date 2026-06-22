import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import sharp from "sharp"; 
import { CustomError } from "./custom-error.js";

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
    cb(
      new CustomError(
        "Tipe file tidak didukung. Gunakan JPEG, PNG, WebP, atau GIF",
        400,
      ),
    );
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

export const MediaService = {
  async uploadThumbnail(
    file: Express.Multer.File | undefined,
  ): Promise<string | null> {
    if (!file) return null;

    try {
      // Contoh batas max lebar/tinggi 1200px
      const maxDimension = 1200; 
      
      const compressedBuffer = await sharp(file.buffer)
        .resize({
          width: maxDimension,
          height: maxDimension,
          fit: "inside", 
          withoutEnlargement: true,
        })
        .jpeg({ quality: 80, progressive: true }) 
        .toBuffer();

      return new Promise<string>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "blog_thumbnails",
          },
          (err, result) => {
            if (err) return reject(err);
            resolve(result!.secure_url);
          },
        );

        // Kirim buffer ke Cloudinary
        stream.end(compressedBuffer);
      });
    } catch (error) {
      throw new CustomError("Gagal memproses dan mengompres gambar", 500);
    }
  },
};