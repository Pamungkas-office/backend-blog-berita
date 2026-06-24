import { Router } from "express";
import rateLimit from "express-rate-limit";
import { forgotPassword } from "../../controllers/auth/forgotPassword.js";
import { resetPassword } from "../../controllers/auth/resetPassword.js";

const passwordRouter = Router();

const forgotPasswordLimiter = rateLimit({
  windowMs: 30 * 60 * 1000,
  max: 3,
  message: {
    success: false,
    message: "Terlalu banyak permintaan. Silakan coba lagi dalam 30 menit.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

passwordRouter.post("/forgot-password", forgotPasswordLimiter, forgotPassword);
passwordRouter.post("/reset-password", resetPassword);

export default passwordRouter;
