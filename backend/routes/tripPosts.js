const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const {
  getAllTripPosts,
  createTripPost,
  toggleLike,
  addComment,
  uploadPhotos
} = require('../controllers/tripPostsController');

router.get('/', getAllTripPosts);
router.post('/', authMiddleware, uploadPhotos, createTripPost);
router.post('/:id/like', authMiddleware, toggleLike);
router.post('/:id/comments', authMiddleware, addComment);

module.exports = router;
