import express from "express";
import { verifyToken } from "../../middleware/auth.middleware.js";
import { getComments } from "../../controllers/user/getComments.js";
import { createComment } from "../../controllers/user/createComment.js";
import { updateComment } from "../../controllers/user/updateComment.js";
import { deleteComment } from "../../controllers/user/deleteComment.js";
import { requireUser } from "../../middleware/user.middleware.js";

const commentRoutes = express.Router();

commentRoutes.get("/:slug", verifyToken, requireUser, getComments);
commentRoutes.post("/:slug", verifyToken, requireUser, createComment);
commentRoutes.patch("/:id", verifyToken, requireUser, updateComment);
commentRoutes.delete("/:id", verifyToken, requireUser, deleteComment);

export default commentRoutes;
