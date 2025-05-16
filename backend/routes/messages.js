const express = require('express');
const router = express.Router();
const { sendMessage, getMessages, listConversations } = require('../controllers/messagesController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/', authMiddleware, sendMessage);
router.get('/:userId', authMiddleware, getMessages);
router.get('/list', authMiddleware, listConversations);

module.exports = router;
