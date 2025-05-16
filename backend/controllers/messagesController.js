const Message = require('../models/Message');

exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const message = await Message.create({
      senderId: req.user.id,
      receiverId,
      content
    });
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: 'Błąd wysyłania wiadomości', details: err.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const messages = await Message.findAll({
      where: {
        senderId: req.user.id,
        receiverId: userId
      }
    });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Błąd pobierania wiadomości', details: err.message });
  }
};

exports.listConversations = async (req, res) => {
    try {
      const [results] = await db.query(`
        SELECT DISTINCT u.id AS userId, u.username
        FROM users u
        JOIN messages m ON (m.senderId = u.id OR m.receiverId = u.id)
        WHERE u.id != :userId AND (m.senderId = :userId OR m.receiverId = :userId)
      `, {
        replacements: { userId: req.user.id }
      });
  
      res.json(results);
    } catch (err) {
      console.error('❌ Błąd pobierania rozmów:', err);
      res.status(500).json({ error: 'Błąd serwera', details: err.message });
    }
  };
  