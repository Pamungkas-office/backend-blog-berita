import express from 'express';
import { verifyToken } from '../../middleware/auth.middleware.ts';
import { getComments } from '../../controllers/user/getComments.ts';
import { createComment } from '../../controllers/user/createComment.ts';
import { updateComment } from '../../controllers/user/updateComment.ts';
import { deleteComment } from '../../controllers/user/deleteComment.ts';
import { requireUser } from '../../middleware/user.middleware.ts';

const commentRoutes = express.Router();

commentRoutes.get('/:slug', verifyToken, requireUser, getComments);
commentRoutes.post('/:slug', verifyToken, requireUser, createComment);
commentRoutes.patch('/:id', verifyToken, requireUser, updateComment);
commentRoutes.delete('/:id', verifyToken, requireUser, deleteComment);

export default commentRoutes;