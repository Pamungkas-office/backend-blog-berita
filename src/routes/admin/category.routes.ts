import express from "express";
import { verifyToken } from "../../middleware/auth.middleware";
import { requireAdmin } from "../../middleware/admin.middleware";
import { createCategory } from "../../controllers/admin/category/createCategory";
import { updateCategory } from "../../controllers/admin/category/updateCategory";
import { deleteCategory } from "../../controllers/admin/category/deleteCategory";

const adminCategoryRouter = express.Router();

adminCategoryRouter.post("/", verifyToken, requireAdmin, createCategory);
adminCategoryRouter.put("/:id", verifyToken, requireAdmin, updateCategory);
adminCategoryRouter.delete("/:id", verifyToken, requireAdmin, deleteCategory);

export default adminCategoryRouter;
