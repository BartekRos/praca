const express = require('express');
const router = express.Router();
const { createChat, sendGroupMessage, getGroupMessages, inviteToChat } = require('../controllers/chatsController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/', authMiddleware, createChat);
router.post('/:chatId/messages', authMiddleware, sendGroupMessage);
router.get('/:chatId/messages', authMiddleware, getGroupMessages);
router.post('/:chatId/invite', authMiddleware, inviteToChat);

module.exports = router;
