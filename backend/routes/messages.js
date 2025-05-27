const express = require('express');
const router = express.Router();
const { startConversation, sendMessage, getMessages, listConversations } = require('../controllers/messagesController');
const { authMiddleware } = require('../middleware/authMiddleware');

console.log("📡 Ładowanie routera: messages.js");

router.post('/start', authMiddleware, startConversation);
router.post('/', authMiddleware, sendMessage);
router.get('/list', authMiddleware, listConversations);
router.get('/:conversationId', authMiddleware, getMessages);

module.exports = router;
