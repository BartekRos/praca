const UserActivity = require('../models/UserActivity');

const logActivity = async (req, res, next) => {
  try {
    const { id } = req.user; // Pobierz ID użytkownika z tokenu
    const action = `${req.method} ${req.originalUrl}`; // Akcja np. POST /api/auth/login

    await UserActivity.create({ userId: id, action });

    next(); // Kontynuuj działanie
  } catch (error) {
    console.error('Błąd logowania aktywności:', error);
    next(); // Kontynuuj mimo błędu
  }
};

module.exports = logActivity;
