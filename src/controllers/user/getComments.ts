import type { NextFunction, Request, Response } from "express";
import { serviceGetComments } from "../../services/user/comments/getComments.js";
import { sendSuccess } from "../../utils/response.js";

export const getComments = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { slug } = req.params;
    const comments = await serviceGetComments(slug as string);
    sendSuccess(res, comments, "Berhasil mendapatkan data komentar");
  } catch (error) {
    next(error);
  }
};
