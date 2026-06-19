import express from "express";
import { verifyToken } from "../../middleware/auth.middleware.js";
import { requireAdmin } from "../../middleware/admin.middleware.js";
import { getAllComments } from "../../controllers/admin/comment/getAllComments.js";
import { deleteComment } from "../../controllers/admin/comment/deleteComment.js";

const adminCommentRouter = express.Router();

adminCommentRouter.get("/", verifyToken, requireAdmin, getAllComments);
adminCommentRouter.delete("/:id", verifyToken, requireAdmin, deleteComment);

export default adminCommentRouter;
