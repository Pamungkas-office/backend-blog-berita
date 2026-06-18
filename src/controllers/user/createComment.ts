import type { NextFunction, Request, Response } from "express";
import { serviceCreateComment } from "../../services/user/comments/createComment.ts";
import { sendSuccess } from "../../utils/response.ts";
import { CustomError } from "../../lib/custom-error.ts";

export const createComment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Ambil user id yang login
    const userId = req.user ? req.user.id : undefined;

    // Ambil postingan tertentu berdasarkan slug
    const slug = req.params?.slug as string;

    // Ambil isi dari comment
    const comment = req.body?.comment;

    // Panggil service serviceCreateComment
    const createdComment = await serviceCreateComment(
      Number(userId),
      slug,
      comment,
    );

    // Response
    sendSuccess(res, createdComment, "Komentar berhasil ditambahkan", 201);
  } catch (error) {
    next(error);
  }
};
