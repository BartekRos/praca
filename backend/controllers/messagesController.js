const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/Users');
const { Op } = require('sequelize');

// Tworzenie lub pobieranie konwersacji
exports.startConversation = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { recipientId } = req.body;

    if (recipientId === senderId) {
      return res.status(400).json({ message: 'Nie możesz rozmawiać sam ze sobą' });
    }

    let conversation = await Conversation.findOne({
      where: {
        [Op.or]: [
          { user1Id: senderId, user2Id: recipientId },
          { user1Id: recipientId, user2Id: senderId },
        ]
      }
    });

    if (!conversation) {
      conversation = await Conversation.create({ user1Id: senderId, user2Id: recipientId });
    }

    res.json(conversation);
  } catch (error) {
    console.error('❌ Błąd startowania rozmowy:', error);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};

// Wysyłanie wiadomości
exports.sendMessage = async (req, res) => {
    const { conversationId, content } = req.body;
    try {
      if (!conversationId) {
        return res.status(400).json({ message: 'Brak conversationId' });
      }
  
      const message = await Message.create({
        conversationId,
        senderId: req.user.id,
        content,
      });
  
      res.json(message);
    } catch (error) {
      console.error('Błąd wysyłania wiadomości:', error);
      res.status(500).json({ message: 'Błąd wysyłania wiadomości' });
    }
  };

// Pobieranie wiadomości z konwersacji
exports.getMessages = async (req, res) => {
  try {
    const conversationId = req.params.conversationId;
    const messages = await Message.findAll({
        where: { conversationId },
        order: [['createdAt', 'ASC']],
        include: [{ model: User, as: 'Sender', attributes: ['id', 'username', 'profilePicture'] }]
      });

    res.json(messages);
  } catch (error) {
    console.error('❌ Błąd pobierania wiadomości:', error);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};

// Lista rozmów użytkownika
exports.listConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    const conversations = await Conversation.findAll({
      where: {
        [Op.or]: [
          { user1Id: userId },
          { user2Id: userId }
        ]
      }
    });

    const result = await Promise.all(conversations.map(async conv => {
      const friendId = conv.user1Id === userId ? conv.user2Id : conv.user1Id;
      const friend = await User.findByPk(friendId);
      return {
        conversationId: conv.id,
        userId: friend.id,
        username: friend.username,
        profilePicture: friend.profilePicture
      };
    }));

    res.json(result);
  } catch (error) {
    console.error('❌ Błąd pobierania rozmów:', error);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};
