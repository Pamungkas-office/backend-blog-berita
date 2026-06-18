import express from 'express';
import { register } from '../../controllers/auth/register.ts';
import { login } from '../../controllers/auth/login.ts';
import { logout } from '../../controllers/auth/logout.ts';
import { me } from '../../controllers/auth/me.ts';
import { getProfile } from '../../controllers/auth/getProfile.ts';
import { updateProfile } from '../../controllers/auth/updateProfile.ts';
import { verifyToken } from '../../middleware/auth.middleware.ts';

const authRouter = express.Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', verifyToken, logout);
authRouter.get('/me', verifyToken, me);
authRouter.get('/profile', verifyToken, getProfile);
authRouter.put('/profile', verifyToken, updateProfile);

export default authRouter;
