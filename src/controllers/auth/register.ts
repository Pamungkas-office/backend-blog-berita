import * as z from "zod";
import type { Request, Response, NextFunction } from "express";
import { serviceRegister } from "../../services/auth/register.js";
import { sendSuccess } from "../../utils/response.js";

const registerSchema = z.object({
  name: z.string().min(3, "Minimal nama terdiri dari 3 karakter"),
  email: z.email().min(3, "Minimal email terdiri dari 3 karakter"),
  password: z.string().min(8, "Minimal password terdiri dari 8 karakter"),
});

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, email, password } = registerSchema.parse(req.body);
    const user = await serviceRegister(name, email, password);
    sendSuccess(res, user, "Registrasi berhasil", 201);
  } catch (error) {
    next(error);
  }
};