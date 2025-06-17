// controllers/messagesController.js
const { Op }       = require('sequelize');
const Conversation = require('../models/Conversation');
const Message      = require('../models/Message');
const User         = require('../models/Users');

/* ------------------------------------------------------------------ */
/*  START lub POBIERZ DM                                              */
/* ------------------------------------------------------------------ */
exports.startConversation = async (req, res) => {
  try {
    const senderId    = req.user.id;
    const { recipientId } = req.body;

    if (senderId === recipientId) {
      return res.status(400).json({ message: 'Nie możesz rozmawiać sam ze sobą' });
    }

    // zawsze zapisuj w kolejności rosnącej
    const [user1Id, user2Id] = senderId < recipientId
      ? [senderId, recipientId]
      : [recipientId, senderId];

    // spróbuj znaleźć lub utworzyć
    const [conversation] = await Conversation.findOrCreate({
      where  : { user1Id, user2Id },
      defaults: { user1Id, user2Id }
    });

    // przydatne dane o korespondencie
    const friendId = senderId === user1Id ? user2Id : user1Id;
    const friend   = await User.findByPk(friendId);

    return res.json({
      conversationId : conversation.id,
      userId         : friend.id,
      username       : friend.username,
      profilePicture : friend.profilePicture
    });

  } catch (err) {
    console.error('❌ startConversation:', err);
    return res.status(500).json({ message: 'Błąd serwera', details: err.message });
  }
};

/* ------------------------------------------------------------------ */
/*  WYSYŁANIE WIADOMOŚCI                                              */
/* ------------------------------------------------------------------ */
exports.sendMessage = async (req, res) => {
  const { conversationId, content } = req.body;
  try {
    if (!conversationId)
      return res.status(400).json({ message: 'Brak conversationId' });

    const msg = await Message.create({
      conversationId,
      senderId : req.user.id,
      content
    });

    res.json(msg);
  } catch (err) {
    console.error('❌ sendMessage:', err);
    res.status(500).json({ message: 'Błąd wysyłania wiadomości' });
  }
};

/* ------------------------------------------------------------------ */
/*  POBIERANIE WIADOMOŚCI Z KONWERSACJI                               */
/* ------------------------------------------------------------------ */
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const msgs = await Message.findAll({
      where  : { conversationId },
      order  : [['createdAt','ASC']],
      include: [{
        model      : User,
        as         : 'Sender',
        attributes : ['id','username','profilePicture']
      }]
    });
    res.json(msgs);
  } catch (err) {
    console.error('❌ getMessages:', err);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};

/* ------------------------------------------------------------------ */
/*  KASOWANIE CAŁEJ ROZMOWY (DM)                                      */
/* ------------------------------------------------------------------ */
exports.deleteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const conv = await Conversation.findByPk(conversationId);
    if (!conv)
      return res.status(404).json({ message: 'Nie znaleziono rozmowy' });

    /* bieżący użytkownik musi być uczestnikiem */
    if (![conv.user1Id, conv.user2Id].includes(req.user.id))
      return res.status(403).json({ message: 'Brak uprawnień' });

    /* 1) kasujemy wiadomości (brak ON DELETE CASCADE) */
    await Message.destroy({ where: { conversationId } });

    /* 2) kasujemy samą rozmowę */
    await conv.destroy();

    res.json({ message: 'Rozmowa usunięta' });
  } catch (err) {
    console.error('❌ deleteConversation:', err);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};

/* ------------------------------------------------------------------ */
/*  LISTA ROZMÓW UŻYTKOWNIKA                                          */
/* ------------------------------------------------------------------ */
exports.listConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    const convs  = await Conversation.findAll({
      where : { [Op.or]: [{ user1Id:userId }, { user2Id:userId }] }
    });

    /* łączymy z danymi znajomego */
    const result = await Promise.all(
      convs.map(async c => {
        const friendId = c.user1Id === userId ? c.user2Id : c.user1Id;
        const friend   = await User.findByPk(friendId, {
          attributes : ['id','username','profilePicture']
        });

        return {
          conversationId : c.id,
          userId         : friend.id,
          username       : friend.username,
          profilePicture : friend.profilePicture
        };
      })
    );

    res.json(result);
  } catch (err) {
    console.error('❌ listConversations:', err);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};
