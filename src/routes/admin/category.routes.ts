import express from "express";
import { verifyToken } from "../../middleware/auth.middleware.js";
import { requireAdmin } from "../../middleware/admin.middleware.js";
import { createCategory } from "../../controllers/admin/category/createCategory.js";
import { updateCategory } from "../../controllers/admin/category/updateCategory.js";
import { deleteCategory } from "../../controllers/admin/category/deleteCategory.js";

const adminCategoryRouter = express.Router();

adminCategoryRouter.post("/", verifyToken, requireAdmin, createCategory);
adminCategoryRouter.put("/:id", verifyToken, requireAdmin, updateCategory);
adminCategoryRouter.delete("/:id", verifyToken, requireAdmin, deleteCategory);

export default adminCategoryRouter;
