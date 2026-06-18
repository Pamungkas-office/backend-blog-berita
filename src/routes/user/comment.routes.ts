import express from "express";
import { verifyToken } from "../../middleware/auth.middleware";
import { getComments } from "../../controllers/user/getComments";
import { createComment } from "../../controllers/user/createComment";
import { updateComment } from "../../controllers/user/updateComment";
import { deleteComment } from "../../controllers/user/deleteComment";
import { requireUser } from "../../middleware/user.middleware";

const commentRoutes = express.Router();

commentRoutes.get("/:slug", verifyToken, requireUser, getComments);
commentRoutes.post("/:slug", verifyToken, requireUser, createComment);
commentRoutes.patch("/:id", verifyToken, requireUser, updateComment);
commentRoutes.delete("/:id", verifyToken, requireUser, deleteComment);

export default commentRoutes;
