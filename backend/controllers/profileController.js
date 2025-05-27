const { User } = require('../models');

exports.getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByPk(userId, {
      attributes: ['id', 'username', 'name', 'email', 'city', 'age', 'profilePicture', 'createdAt', 'updatedAt'],
    });

    if (!user) return res.status(404).json({ message: 'Użytkownik nie znaleziony' });
    res.json(user);
  } catch (error) {
    console.error('Błąd pobierania profilu:', error);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};
