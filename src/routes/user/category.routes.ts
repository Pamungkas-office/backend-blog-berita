import express from "express";
import { getAllCategories } from "../../controllers/category.controller";

const categoryRouter = express.Router();

categoryRouter.get("/", getAllCategories);

export default categoryRouter;
