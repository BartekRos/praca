const db = require('../config/db');
const { QueryTypes } = require('sequelize');

exports.getUserProfile = (req, res) => {
  const userId = req.user?.id;
  console.log('Decoded user w req:', req.user);

  if (!userId) {
    return res.status(401).json({ message: 'Brak ID użytkownika w tokenie' });
  }

  const q = 'SELECT id, username, email FROM users WHERE id = :id';
  db.query(q, {
      replacements: { id: userId },
      type: QueryTypes.SELECT
    })
    .then(data => {
      if (data.length === 0) {
        return res.status(404).json({ message: 'Użytkownik nie znaleziony' });
      }
      res.json(data[0]);
    })
    .catch(err => {
      console.error('Błąd zapytania:', err);
      res.status(500).json({ message: 'Błąd serwera' });
    });
};
