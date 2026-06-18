import type { NextFunction, Request, Response } from "express";
import { serviceDeleteTag } from "../../../services/admin/tag/deleteTag.ts";
import { sendSuccess } from "../../../utils/response.ts";

export const deleteTag = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    await serviceDeleteTag(id);
    sendSuccess(res, null, "Tag berhasil dihapus");
  } catch (error) {
    next(error);
  }
};
