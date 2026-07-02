import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { serviceRevisionPost } from "../../../services/admin/approval/approvalService.js";
import { sendSuccess } from "../../../utils/response.js";

const revisionSchema = z.object({
  notes: z.string().min(1, "Catatan revisi wajib diisi"),
});

export const revisionPost = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);
    const { notes } = revisionSchema.parse(req.body);

    const result = await serviceRevisionPost(id, Number(req.user!.id), notes);
    sendSuccess(res, result, "Post dikembalikan untuk revisi");
  } catch (error) {
    next(error);
  }
};
