const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const {
  getAllTripPosts,
  createTripPost,
  uploadPhotos,
  toggleLike,
  addComment,
  getComments,
  deleteComment,
  getLikesCount
} = require('../controllers/tripPostsController');

router.get('/', getAllTripPosts);
router.post('/', authMiddleware, uploadPhotos, createTripPost);
// 🆕 KOMENTARZE
router.get('/:postId/comments', getComments);
router.post('/:postId/comments', authMiddleware, addComment);
router.delete('/comments/:commentId', authMiddleware, deleteComment);
// 🆕 LAJKI
router.post('/:postId/like', authMiddleware, toggleLike);
router.get('/:postId/likes-count', getLikesCount);

module.exports = router;
