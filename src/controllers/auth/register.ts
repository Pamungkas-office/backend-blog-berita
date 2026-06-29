import * as z from "zod";
import type { Request, Response, NextFunction } from "express";
import { serviceRegister } from "../../services/auth/register.js";
import { sendSuccess } from "../../utils/response.js";

const registerSchema = z.object({
  name: z.string().min(3, "Minimal nama terdiri dari 3 karakter"),
  email: z.email().min(3, "Minimal email terdiri dari 3 karakter"),
  password: z.string().min(8, "Minimal password terdiri dari 8 karakter"),
});

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     description: Create a new user account. A verification email will be sent.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 example: password123
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Registrasi berhasil. Silakan cek email untuk verifikasi.
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                       example: user
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email already registered
 *       500:
 *         description: Internal server error
 */
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, email, password } = registerSchema.parse(req.body);
    const user = await serviceRegister(name, email, password);
    sendSuccess(res, user, "Registrasi berhasil. Silakan cek email untuk verifikasi.", 201);
  } catch (error) {
    next(error);
  }
};