import express from "express";
import { register } from "../../controllers/auth/register.js";
import { login } from "../../controllers/auth/login.js";
import { logout } from "../../controllers/auth/logout.js";
import { me } from "../../controllers/auth/me.js";
import { getProfile } from "../../controllers/auth/getProfile.js";
import { updateProfile } from "../../controllers/auth/updateProfile.js";
import { verifyToken } from "../../middleware/auth.middleware.js";

const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", verifyToken, logout);
authRouter.get("/me", verifyToken, me);
authRouter.get("/profile", verifyToken, getProfile);
authRouter.put("/profile", verifyToken, updateProfile);

export default authRouter;
