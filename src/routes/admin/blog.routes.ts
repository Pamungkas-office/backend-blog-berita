import express from "express";
import { verifyToken } from "../../middleware/auth.middleware";
import { requireAdmin } from "../../middleware/admin.middleware";
import { upload } from "../../lib/upload";
import { getAllNews } from "../../controllers/admin/blog/getAllNews";
import { createNewNews } from "../../controllers/admin/blog/createNewNews";
import { updateNews } from "../../controllers/admin/blog/updateNews";
import { deleteNews } from "../../controllers/admin/blog/deleteNews";
import { getNewsById } from "../../controllers/admin/blog/getNewsById";

const adminBlogRouter = express.Router();

adminBlogRouter.get("/", verifyToken, requireAdmin, getAllNews);
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
