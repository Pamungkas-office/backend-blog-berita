import type { Request, Response, NextFunction } from "express";
import * as z from 'zod';
import { serviceLogin } from "../../services/auth/login.js";
import { sendSuccess } from "../../utils/response.js";

const loginSchema = z.object({
  email: z.email().min(3, "Minimal email terdiri dari 3 karakter"),
  password: z.string().min(1, "Password wajib diisi"),
});

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login user
 *     description: Authenticate user and return JWT token. Token is also set as httpOnly cookie.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                         role:
 *                           type: string
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid email or password
 *       403:
 *         description: Email not verified
 *       500:
 *         description: Internal server error
 */
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