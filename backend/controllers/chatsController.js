const Chat = require('../models/Chat');
const ChatParticipant = require('../models/ChatParticipant');
const GroupMessage = require('../models/GroupMessage');

exports.createChat = async (req, res) => {
  try {
    const { name } = req.body;
    const chat = await Chat.create({ name, createdBy: req.user.id });
    await ChatParticipant.create({ chatId: chat.id, userId: req.user.id });
    res.json(chat);
  } catch (err) {
    res.status(500).json({ error: 'Błąd tworzenia grupy', details: err.message });
  }
};

exports.sendGroupMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content } = req.body;

    // (Możesz tu dodać walidację czy user jest w grupie)
    const message = await GroupMessage.create({
      chatId,
      senderId: req.user.id,
      content
    });
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: 'Błąd wysyłania wiadomości grupowej', details: err.message });
  }
};

exports.getGroupMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const messages = await GroupMessage.findAll({ where: { chatId } });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Błąd pobierania wiadomości grupowych', details: err.message });
  }
};

exports.inviteToChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { userId } = req.body;
    await ChatParticipant.create({ chatId, userId });
    res.json({ message: 'Użytkownik dodany do grupy' });
  } catch (err) {
    res.status(500).json({ error: 'Błąd dodawania uczestnika', details: err.message });
  }
};
