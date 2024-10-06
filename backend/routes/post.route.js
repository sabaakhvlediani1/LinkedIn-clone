import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { createPost, deletePost, getFeedPosts,getPostById,createComment } from "../controllers/post.controller.js";

const router = express.Router();

router.get("/", protectRoute, getFeedPosts)
router.post("/create",protectRoute, createPost);
router.post("/delete/:id",protectRoute, deletePost);
router.get("/:id",protectRoute, getPostById);
router.post("/:id/comment",protectRoute, createComment);


export default router;