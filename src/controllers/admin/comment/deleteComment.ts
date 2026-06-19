import type { NextFunction, Request, Response } from "express";
import { serviceDeleteComment } from "../../../services/admin/comment/deleteComment.js";
import { sendSuccess } from "../../../utils/response.js";

export const deleteComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    await serviceDeleteComment(id);
    sendSuccess(res, null, "Komentar berhasil dihapus");
  } catch (error) {
    next(error);
  }
};
