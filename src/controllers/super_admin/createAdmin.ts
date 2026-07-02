import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { serviceCreateAdmin } from "../../services/super_admin/createAdmin.js";
import { sendSuccess } from "../../utils/response.js";

const createAdminSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  is_approver: z.boolean().optional().default(false),
});

export const createAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, email, password, is_approver } = createAdminSchema.parse(
      req.body,
    );

    const result = await serviceCreateAdmin(name, email, password, is_approver);
    sendSuccess(res, result, "Admin baru berhasil ditambahkan");
  } catch (error) {
    next(error);
  }
};
