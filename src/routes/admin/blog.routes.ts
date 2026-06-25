import express from "express";
import { verifyToken } from "../../middleware/auth.middleware.js";
import { requireAdmin } from "../../middleware/admin.middleware.js";
import { upload } from "../../lib/upload.js";
import { getAllNews } from "../../controllers/admin/blog/getAllNews.js";
import { createNewNews } from "../../controllers/admin/blog/createNewNews.js";
import { updateNews } from "../../controllers/admin/blog/updateNews.js";
import { deleteNews } from "../../controllers/admin/blog/deleteNews.js";
import { getNewsById } from "../../controllers/admin/blog/getNewsById.js";
import { generateNews } from "../../controllers/admin/blog/generateNews.js";
import { saveGeneratedNews } from "../../controllers/admin/blog/saveGeneratedNews.js";

const adminBlogRouter = express.Router();

adminBlogRouter.get("/", verifyToken, requireAdmin, getAllNews);

adminBlogRouter.post(
  "/generate",
  verifyToken,
  requireAdmin,
  generateNews,
);

adminBlogRouter.post(
  "/save-generated",
  verifyToken,
  requireAdmin,
  saveGeneratedNews,
);

adminBlogRouter.post(
  "/",
  verifyToken,
  requireAdmin,
  upload.single("thumbnail"),
  createNewNews,
);

adminBlogRouter.get("/:id", verifyToken, requireAdmin, getNewsById);
adminBlogRouter.put(
  "/:id",
  verifyToken,
  requireAdmin,
  upload.single("thumbnail"),
  updateNews,
);
adminBlogRouter.delete("/:id", verifyToken, requireAdmin, deleteNews);

export default adminBlogRouter;
