import type { NextFunction, Request, Response } from "express";
import { serviceDeleteComment } from "../../services/user/comments/deleteComment.js";
import { sendSuccess } from "../../utils/response.js";

export const deleteComment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const commentId = Number(req.params?.id);
    const userId = Number(req.user?.id);

    await serviceDeleteComment(commentId, userId);

    sendSuccess(res, "Komentar berhasil dihapus");
  } catch (error) {
    next(error);
  }
};
