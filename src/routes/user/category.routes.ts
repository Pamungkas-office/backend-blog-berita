import express from 'express';
import { getAllCategories } from '../../controllers/category.controller.ts';

const categoryRouter = express.Router();

categoryRouter.get('/', getAllCategories);

export default categoryRouter;
