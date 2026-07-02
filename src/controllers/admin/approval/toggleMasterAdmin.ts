import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { serviceToggleMasterAdmin } from "../../../services/admin/approval/approvalService.js";
import { sendSuccess } from "../../../utils/response.js";

const toggleSchema = z.object({
  is_approver: z.coerce.boolean(),
});

export const toggleMasterAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = Number(req.params.userId);
    const { is_approver } = toggleSchema.parse(req.body);

    const result = await serviceToggleMasterAdmin(userId, is_approver);
    sendSuccess(res, result, "Status approver berhasil diperbarui");
  } catch (error) {
    next(error);
  }
};
