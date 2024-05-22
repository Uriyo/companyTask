const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createPost,
  getPosts,
  updatePost,
  deletePost,
  likePost,
  addComment,
  upload,
} = require("../controllers/PostController");

router.route('/')
  .post(protect, upload, createPost)
  .get(getPosts);

router.route('/:postId')
  .put(protect, upload, updatePost)
  .delete(protect, deletePost);

router.route('/:postId/like')
  .post(protect, likePost);

router.route('/:postId/comment')
  .post(protect, addComment);

module.exports = router;
