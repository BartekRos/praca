const Chat = require('../models/Chat');
const ChatParticipant = require('../models/ChatParticipant');
const GroupMessage = require('../models/GroupMessage');
const Users = require('../models/Users');

exports.createChat = async (req, res) => {
  try {
    const { name, participantIds } = req.body;
    // 1) stwórz czat
    const chat = await Chat.create({ name, createdBy: req.user.id });
    // 2) dodaj siebie
    await ChatParticipant.create({ chatId: chat.id, userId: req.user.id });
    // 3) dodaj pozostałych
    if (Array.isArray(participantIds)) {
      const toCreate = participantIds
        // unikamy duplikatów i pomijamy siebie
        .filter(id => id !== req.user.id)
        .map(userId => ({ chatId: chat.id, userId }));
      await ChatParticipant.bulkCreate(toCreate);
    }
    res.status(201).json(chat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Błąd tworzenia grupy', details: err.message });
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
    const messages = await GroupMessage.findAll({
      where: { chatId },
      include: [{ model: Users, attributes: ['id', 'username', 'profilePicture'] }],
    });    
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

exports.listChats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Znajdź wszystkie czaty, w których uczestniczy ten użytkownik
    const chats = await ChatParticipant.findAll({
      where: { userId },
      include: [
        {
          model: Chat,
          include: [
            {
              model: ChatParticipant,
              include: {
                model: Users,
                attributes: ['id', 'username', 'name', 'profilePicture'],
              },
            },
          ],
        },
      ],
    });

    // Przekształć wynik do czytelnej struktury
    const chatList = chats.map(p => {
      const chat = p.Chat;
      const participants = chat.ChatParticipants.map(cp => cp.User);
      return {
        id: chat.id,
        name: chat.name,
        participants,
      };
    });

    res.json(chatList);
  } catch (err) {
    console.error('❌ Błąd pobierania czatów:', err);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};