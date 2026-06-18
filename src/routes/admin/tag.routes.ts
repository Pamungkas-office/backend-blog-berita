import express from "express";
import { verifyToken } from "../../middleware/auth.middleware";
import { requireAdmin } from "../../middleware/admin.middleware";
import { createTag } from "../../controllers/admin/tag/createTag";
import { updateTag } from "../../controllers/admin/tag/updateTag";
import { deleteTag } from "../../controllers/admin/tag/deleteTag";

const adminTagRouter = express.Router();

adminTagRouter.post("/", verifyToken, requireAdmin, createTag);
adminTagRouter.put("/:id", verifyToken, requireAdmin, updateTag);
adminTagRouter.delete("/:id", verifyToken, requireAdmin, deleteTag);

export default adminTagRouter;
