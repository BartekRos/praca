// controllers/chatsController.js
const Chat            = require('../models/Chat');
const ChatParticipant = require('../models/ChatParticipant');
const GroupMessage    = require('../models/GroupMessage');
const User            = require('../models/Users');
const { Op }          = require('sequelize');

/* ===== 1. CREATE ======================================================= */
exports.createChat = async (req, res) => {
  try {
    const { name, participantIds = [] } = req.body;

    const chat = await Chat.create({ name, createdBy: req.user.id });

    const uniqueIds = [...new Set(participantIds.filter(id => id !== req.user.id))];
    const bulkRows  = uniqueIds.map(id => ({ chatId: chat.id, userId: id }));

    await ChatParticipant.bulkCreate([
      { chatId: chat.id, userId: req.user.id },
      ...bulkRows,
    ]);

    /* opcjonalnie można tu dodać komunikat systemowy o utworzeniu grupy */

    res.status(201).json(chat);
  } catch (err) {
    console.error('❌ createChat:', err);
    res.status(500).json({ message: 'Błąd tworzenia grupy', details: err.message });
  }
};

/* ===== 2. INVITE (owner) ============================================== */
exports.inviteToChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { userId } = req.body;

    const chat = await Chat.findByPk(chatId);
    if (!chat) return res.status(404).json({ message: 'Grupa nie istnieje' });

    if (chat.createdBy !== req.user.id)
      return res.status(403).json({ message: 'Tylko twórca grupy może zapraszać' });

    const userExists = await User.findByPk(userId);
    if (!userExists) return res.status(404).json({ message: 'Użytkownik nie istnieje' });

    const already = await ChatParticipant.findOne({ where: { chatId, userId } });
    if (already) return res.json({ message: 'Użytkownik już znajduje się w grupie' });

    await ChatParticipant.create({ chatId, userId });

    /* --- wiadomość systemowa ---------------------------------------- */
    await GroupMessage.create({
      chatId,
      senderId : null,
      system   : true,
      content  : `${userExists.username} dołączył(a) do grupy`
    });
    /* ----------------------------------------------------------------- */

    res.status(201).json({ message: 'Dodano do grupy' });
  } catch (err) {
    console.error('❌ inviteToChat:', err);
    res.status(500).json({ message: 'Błąd serwera', details: err.message });
  }
};

/* ===== 3. KICK MEMBER (owner) ========================================= */
exports.kickMember = async (req, res) => {
  try {
    const { chatId, userId } = req.params;

    const chat = await Chat.findByPk(chatId);
    if (!chat) return res.status(404).json({ message: 'Grupa nie istnieje' });

    if (chat.createdBy !== req.user.id)
      return res.status(403).json({ message: 'Tylko twórca grupy może usuwać członków' });

    if (+userId === chat.createdBy)
      return res.status(400).json({ message: 'Twórca nie może usunąć samego siebie' });

    const deleted = await ChatParticipant.destroy({ where: { chatId, userId } });
    if (!deleted)
      return res.status(404).json({ message: 'Użytkownika nie ma w grupie' });

    const kickedUser = await User.findByPk(userId);

    /* --- systemowy wpis --------------------------------------------- */
    await GroupMessage.create({
      chatId,
      senderId : null,
      system   : true,
      content  : `${kickedUser.username} został(a) usunięty(a) z grupy`
    });
    /* ----------------------------------------------------------------- */

    res.status(204).end();
  } catch (err) {
    console.error('❌ kickMember:', err);
    res.status(500).json({ message: 'Błąd serwera', details: err.message });
  }
};

/* ===== 4. LEAVE ======================================================== */
exports.leaveChat = async (req, res) => {
  try {
    const { chatId } = req.params;

    const chat = await Chat.findByPk(chatId);
    if (!chat) return res.status(404).json({ message: 'Grupa nie istnieje' });

    if (chat.createdBy === req.user.id)
      return res.status(403).json({ message: 'Twórca nie może opuścić – usuń grupę' });

    const left = await ChatParticipant.destroy({ where: { chatId, userId: req.user.id } });
    if (!left) return res.status(404).json({ message: 'Nie jesteś w tej grupie' });

    /* --- systemowy wpis --------------------------------------------- */
    await GroupMessage.create({
      chatId,
      senderId : null,
      system   : true,
      content  : `${req.user.username} opuścił(a) grupę`
    });
    /* ----------------------------------------------------------------- */

    res.status(204).end();
  } catch (err) {
    console.error('❌ leaveChat:', err);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};

/* ===== 5. SEND / GET MESSAGES ========================================= */
exports.sendGroupMessage = async (req, res) => {
  try {
    const { chatId }  = req.params;
    const { content } = req.body;

    const member = await ChatParticipant.findOne({ where: { chatId, userId: req.user.id } });
    if (!member) return res.status(403).json({ message: 'Brak dostępu do grupy' });

    const msg = await GroupMessage.create({ chatId, senderId: req.user.id, content });
    res.json(msg);
  } catch (err) {
    console.error('❌ sendGroupMessage:', err);
    res.status(500).json({ message: 'Błąd wysyłania wiadomości' });
  }
};

exports.getGroupMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const msgs = await GroupMessage.findAll({
      where  : { chatId },
      include: [{ model: User, attributes: ['id','username','profilePicture'] }],
      order  : [['createdAt','ASC']],
    });
    res.json(msgs);
  } catch (err) {
    console.error('❌ getGroupMessages:', err);
    res.status(500).json({ message: 'Błąd pobierania wiadomości' });
  }
};

/* ===== 6. LIST USER CHATS ============================================= */
exports.listUserChats = async (req, res) => {
  try {
    const memberships = await ChatParticipant.findAll({
      where  : { userId: req.user.id },
      include: [{
        model     : Chat,
        include   : [{
          model     : User,
          as        : 'participants',
          through   : { attributes: [] },
          attributes: ['id','username','profilePicture']
        }]
      }]
    });

    res.json(memberships.map(m => m.Chat));
  } catch (err) {
    console.error('❌ listUserChats:', err);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};

/* ===== 7. GET PARTICIPANTS ============================================ */
exports.getParticipants = async (req, res) => {
  try {
    const { chatId } = req.params;

    /* upewnij się, że proszący jest członkiem */
    const member = await ChatParticipant.findOne({
      where: { chatId, userId: req.user.id }
    });
    if (!member)
      return res.status(403).json({ message: 'Brak dostępu do grupy' });

    const users = await ChatParticipant.findAll({
      where  : { chatId },
      include: [{ model: User, attributes: ['id','username','name','profilePicture'] }]
    });

    res.json(users.map(u => u.User));
  } catch (err) {
    console.error('❌ getParticipants:', err);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};

/* ===== 8. DELETE (owner) ============================================== */
exports.deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params;

    const chat = await Chat.findByPk(chatId);
    if (!chat) return res.status(404).json({ message: 'Nie znaleziono grupy' });

    if (chat.createdBy !== req.user.id)
      return res.status(403).json({ message: 'Tylko twórca grupy może ją usunąć' });

    await chat.destroy();   // ON DELETE CASCADE
    res.status(204).end();
  } catch (err) {
    console.error('❌ deleteChat:', err);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};
