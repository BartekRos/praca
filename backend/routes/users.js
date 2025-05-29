const express = require('express');
const router = express.Router();
const { getUserProfile } = require('../controllers/usersController');
console.log('getUserProfile is:', getUserProfile);
const { authMiddleware } = require('../middleware/authMiddleware');
const Users = require('../models/Users');

router.get('/profile', authMiddleware, getUserProfile);

router.get('/:id', authMiddleware, async (req, res) => {
    try {
      const user = await Users.findByPk(req.params.id, {
        attributes: ['id', 'username', 'name', 'profilePicture'],
      });
  
      if (!user) return res.status(404).json({ message: 'Użytkownik nie znaleziony' });
  
      res.json(user);
    } catch (err) {
      console.error('❌ Błąd pobierania użytkownika:', err);
      res.status(500).json({ message: 'Błąd serwera' });
    }
  });

module.exports = router;
