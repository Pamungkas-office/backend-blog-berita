import type { NextFunction, Request, Response } from "express";
import { serviceUpdateComment } from "../../services/user/comments/updateComment.ts";
import { sendSuccess } from "../../utils/response.ts";

export const updateComment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const commentId = Number(req.params?.id);
    const userId = Number(req.user?.id);
    const commentText = req.body?.comment;

    const updatedComment = await serviceUpdateComment(commentId, userId, commentText);

    sendSuccess(res, updatedComment, "Komentar berhasil diperbarui");
  } catch (error) {
    next(error);
  }
};