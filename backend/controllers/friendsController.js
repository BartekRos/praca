const Friendship = require('../models/Friendships');
const Users = require('../models/Users');
const { Op } = require('sequelize');

// Wysyłanie zaproszenia
exports.sendFriendRequest = async (req, res) => {
  try {
    const { friendId } = req.body;
    const userId = req.user.id;

    // 🔍 Sprawdź, czy już istnieje zaproszenie lub znajomość
    const existing = await Friendship.findOne({
      where: {
        [Op.or]: [
          { userId, friendId },
          { userId: friendId, friendId: userId }
        ]
      }
    });

    if (existing) {
      if (existing.status === "pending") {
        return res.status(400).json({ message: "Poczekaj aż użytkownik odpowie na twoją prośbę" });
      }
      if (existing.status === "accepted") {
        return res.status(400).json({ message: "Użytkownik jest już twoim znajomym" });
      }
    }

    // Jeśli nie ma żadnej relacji — utwórz zaproszenie
    await Friendship.create({ userId, friendId });

    res.json({ message: "Zaproszenie wysłane" });
  } catch (error) {
    console.error("Błąd wysyłania zaproszenia:", error);
    res.status(500).json({ message: "Błąd serwera" });
  }
};

// Akceptowanie zaproszenia
exports.acceptFriendRequest = async (req, res) => {
  try {
    const friendship = await Friendship.findOne({
      where: { id: req.params.requestId, friendId: req.user.id },
    });

    if (!friendship) return res.status(404).json({ message: 'Zaproszenie nie znalezione' });

    friendship.status = 'accepted';
    await friendship.save();

    res.json({ message: 'Zaproszenie zaakceptowane' });
  } catch (error) {
    console.error('Błąd akceptowania zaproszenia:', error);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};

// Odrzucenie zaproszenia
exports.declineRequest = async (req, res) => {
    const userId = req.user.id;
    const requestId = parseInt(req.params.requestId, 10);
  
    if (!requestId) {
      return res.status(400).json({ message: 'Niepoprawny ID zaproszenia.' });
    }
  
    try {
      const request = await Friendship.findOne({
        where: {
          id: requestId,
          friendId: userId,
          status: 'pending',
        },
      });
  
      if (!request) {
        return res.status(404).json({ message: 'Zaproszenie nie istnieje lub już zostało przetworzone.' });
      }
  
      await request.destroy();
  
      res.json({ message: 'Zaproszenie odrzucone.' });
    } catch (error) {
      console.error('Błąd odrzucania zaproszenia:', error);
      res.status(500).json({ message: 'Błąd serwera.' });
    }
  };
  

// Usuwanie znajomego
exports.removeFriend = async (req, res) => {
    try {
      const userId = req.user.id;
      const friendId = parseInt(req.params.friendId, 10);
  
      console.log('User ID:', userId);
      console.log('Friend ID:', friendId);
  
      if (!friendId || isNaN(friendId)) {
        return res.status(400).json({ message: 'Niepoprawny ID znajomego.' });
      }
  
      const deleted = await Friendship.destroy({
        where: {
          [Op.or]: [
            { userId, friendId },
            { userId: friendId, friendId: userId },
          ],
        },
      });
  
      if (deleted === 0) {
        return res.status(404).json({ message: 'Nie znaleziono relacji do usunięcia.' });
      }
  
      res.json({ message: 'Znajomy został usunięty.' });
    } catch (error) {
      console.error('Błąd usuwania znajomego:', error);
      res.status(500).json({ message: 'Błąd serwera' });
    }
  };
  

// Lista zaakceptowanych znajomych
exports.getFriends = async (req, res) => {
    try {
      const friendsAsSender = await Friendship.findAll({
        where: { userId: req.user.id, status: 'accepted' },
        include: [{ model: Users, as: 'receiver', attributes: ['id', 'username', 'name', 'profilePicture'] }],
      });
  
      const friendsAsReceiver = await Friendship.findAll({
        where: { friendId: req.user.id, status: 'accepted' },
        include: [{ model: Users, as: 'sender', attributes: ['id', 'username', 'name', 'profilePicture'] }],
      });
  
      const friends = [
        ...friendsAsSender.map(f => f.receiver),
        ...friendsAsReceiver.map(f => f.sender),
      ];
  
      res.json(friends);
    } catch (error) {
      console.error('Błąd pobierania znajomych:', error);
      res.status(500).json({ message: 'Błąd serwera' });
    }
  };
  

// Lista zaproszeń oczekujących
exports.getPendingRequests = async (req, res) => {
    try {
      const requests = await Friendship.findAll({
        where: { friendId: req.user.id, status: 'pending' },
        include: [{ model: Users, as: 'sender', attributes: ['id', 'username', 'name', 'profilePicture'] }],
      });
      res.json(requests.map(r => ({
        requestId: r.id,
        ...r.sender.dataValues,
      })));
    } catch (error) {
      console.error('Błąd pobierania zaproszeń:', error);
      res.status(500).json({ message: 'Błąd serwera' });
    }
  };
  

// Wyszukiwanie użytkowników nie będących znajomymi
exports.searchUsers = async (req, res) => {
    try {
      const searchTerm = req.query.q;
  
      const friends = await Friendship.findAll({
        where: {
          [Op.or]: [
            { userId: req.user.id },
            { friendId: req.user.id },
          ],
        },
      });
  
      // Pobierz wszystkie ID, z którymi mamy już relacje
      const friendIds = new Set();
      friends.forEach(f => {
        friendIds.add(f.userId);
        friendIds.add(f.friendId);
      });
      friendIds.add(req.user.id);
  
      const users = await Users.findAll({
        where: {
          id: { [Op.notIn]: Array.from(friendIds) },
          [Op.or]: [
            { username: { [Op.like]: `%${searchTerm}%` } },
            { name: { [Op.like]: `%${searchTerm}%` } },
          ],
        },
        attributes: ['id', 'username', 'name', 'profilePicture'],
      });
  
      res.json(users);
    } catch (error) {
      console.error('Błąd wyszukiwania użytkowników:', error);
      res.status(500).json({ message: 'Błąd serwera' });
    }
  };