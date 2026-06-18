import type { Request, Response, NextFunction } from "express";
import * as z from 'zod';
import { serviceLogin } from "../../services/auth/login.js";
import { sendSuccess } from "../../utils/response.js";

const loginSchema = z.object({
  email: z.email().min(3, "Minimal email terdiri dari 3 karakter"),
  password: z.string().min(1, "Password wajib diisi"),
});

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const result = await serviceLogin(email, password);

    res.cookie("auth_token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    sendSuccess(res, result, "Login berhasil");
  } catch (error) {
    next(error);
  }
};