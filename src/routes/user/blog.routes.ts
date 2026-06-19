import express from "express";
import { getAllPublishedPost } from "../../controllers/blog/getAllPublishedPost.js";
import { getPostBySlug } from "../../controllers/blog/getPostBySlug.js";

const blogRouter = express.Router();

blogRouter.get("/", getAllPublishedPost);
blogRouter.get("/:slug", getPostBySlug);

export default blogRouter;
