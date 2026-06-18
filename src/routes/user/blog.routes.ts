import express from 'express';
import { getAllPublishedPost } from '../../controllers/blog/getAllPublishedPost.ts';
import { getPostBySlug } from '../../controllers/blog/getPostBySlug.ts';

const blogRouter = express.Router();

blogRouter.get('/', getAllPublishedPost);
blogRouter.get('/:slug', getPostBySlug);

export default blogRouter;
