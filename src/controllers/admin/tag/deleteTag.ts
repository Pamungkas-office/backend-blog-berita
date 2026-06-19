import type { NextFunction, Request, Response } from "express";
import { serviceDeleteTag } from "../../../services/admin/tag/deleteTag.js";
import { sendSuccess } from "../../../utils/response.js";

export const deleteTag = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    await serviceDeleteTag(id);
    sendSuccess(res, null, "Tag berhasil dihapus");
  } catch (error) {
    next(error);
  }
};
