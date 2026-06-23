import { Router } from "express";
import { forgotPassword } from "../../controllers/auth/forgotPassword.js";
import { resetPassword } from "../../controllers/auth/resetPassword.js";

const passwordRouter = Router();

passwordRouter.post("/forgot-password", forgotPassword);
passwordRouter.post("/reset-password", resetPassword);

export default passwordRouter;
