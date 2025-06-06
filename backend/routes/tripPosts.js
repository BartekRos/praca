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
  getLikesCount,
  checkLiked,
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
router.get('/:postId/liked', authMiddleware, checkLiked);
// 🆕 Pobieranie postów danego użytkownika
router.get('/user/:userId', async (req, res) => {
  const TripPost = require('../models/TripPost');
  const User = require('../models/Users');

  try {
    const posts = await TripPost.findAll({
      where: { userId: req.params.userId },
      include: {
        model: User,
        attributes: ['id', 'username', 'profilePicture'],
      },
      order: [['createdAt', 'DESC']],
    });

    res.json(posts);
  } catch (error) {
    console.error("❌ Błąd pobierania postów użytkownika:", error);
    res.status(500).json({ message: "Błąd serwera" });
  }
});

module.exports = router;
