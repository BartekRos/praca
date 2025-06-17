const express = require('express');
const router  = express.Router();

const {
  startConversation,
  sendMessage,
  getMessages,
  listConversations,
  deleteConversation,   // 👈 dodany import
} = require('../controllers/messagesController');

const { authMiddleware } = require('../middleware/authMiddleware');

console.log('📡 Ładowanie routera: routes/messages.js');

/* ---------- trasy ---------- */
router.post('/start',               authMiddleware, startConversation);
router.post('/',                    authMiddleware, sendMessage);
router.get('/list',                 authMiddleware, listConversations);
router.get('/:conversationId',      authMiddleware, getMessages);
router.delete('/:conversationId',   authMiddleware, deleteConversation);  // 👈 poprawiona trasa

module.exports = router;