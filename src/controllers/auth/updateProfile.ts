import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { serviceUpdateProfile } from "../../services/auth/updateProfile.ts";
import { sendSuccess } from "../../utils/response.ts";

const updateProfileSchema = z.object({
  name: z.string().min(3, "Minimal nama terdiri dari 3 karakter").optional(),
  email: z.email().min(3, "Minimal email terdiri dari 3 karakter").optional(),
});

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email } = updateProfileSchema.parse(req.body);
    const profile = await serviceUpdateProfile(req.user!.id, name, email);
    sendSuccess(res, profile, "Profile berhasil diperbarui");
  } catch (error) {
    next(error);
  }
};
