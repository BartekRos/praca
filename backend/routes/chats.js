// routes/chats.js
const express            = require('express');
const router             = express.Router();
const chatsController    = require('../controllers/chatsController');
const { authMiddleware } = require('../middleware/authMiddleware');

/* ─────────── tworzenie / lista ─────────── */
router.post('/',  authMiddleware, chatsController.createChat);
router.get('/',   authMiddleware, chatsController.listUserChats);      // zwraca czaty + participants

/* ─────────── uczestnicy ─────────── */
router.get('/:chatId/participants', authMiddleware, chatsController.getParticipants);

/* ─────────── wiadomości grupowe ────────── */
router.get('/:chatId/messages',  authMiddleware, chatsController.getGroupMessages);
router.post('/:chatId/messages', authMiddleware, chatsController.sendGroupMessage);

/* ─────────── zarządzanie uczestnikami ──── */
router.post('/:chatId/invite',         authMiddleware, chatsController.inviteToChat); // owner
router.delete('/:chatId/members/:userId', authMiddleware, chatsController.kickMember); // owner
router.delete('/:chatId/leave',        authMiddleware, chatsController.leaveChat);    // każdy

/* ─────────── usuwanie grupy (owner) ────── */
router.delete('/:chatId', authMiddleware, chatsController.deleteChat);

module.exports = router;
