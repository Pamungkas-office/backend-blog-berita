import express from "express";
import { getAllPublishedPost } from "../../controllers/blog/getAllPublishedPost";
import { getPostBySlug } from "../../controllers/blog/getPostBySlug";

const blogRouter = express.Router();

blogRouter.get("/", getAllPublishedPost);
blogRouter.get("/:slug", getPostBySlug);

export default blogRouter;
