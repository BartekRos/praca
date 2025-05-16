const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const friendsController = require('../controllers/friendsController');

router.post('/request', authMiddleware, friendsController.sendFriendRequest);
router.put('/accept/:requestId', authMiddleware, friendsController.acceptFriendRequest);
router.get('/', authMiddleware, friendsController.getFriends);
router.get('/requests', authMiddleware, friendsController.getPendingRequests);
router.get('/search', authMiddleware, friendsController.searchUsers);
router.delete('/:friendId', authMiddleware, friendsController.removeFriend);
router.delete('/decline/:requestId', authMiddleware, friendsController.declineRequest);


module.exports = router;
