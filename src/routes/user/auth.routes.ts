import express from "express";
import { register } from "../../controllers/auth/register";
import { login } from "../../controllers/auth/login";
import { logout } from "../../controllers/auth/logout";
import { me } from "../../controllers/auth/me";
import { getProfile } from "../../controllers/auth/getProfile";
import { updateProfile } from "../../controllers/auth/updateProfile";
import { verifyToken } from "../../middleware/auth.middleware";

const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", verifyToken, logout);
authRouter.get("/me", verifyToken, me);
authRouter.get("/profile", verifyToken, getProfile);
authRouter.put("/profile", verifyToken, updateProfile);

export default authRouter;
