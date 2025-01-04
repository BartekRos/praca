const express = require('express');
const { body, validationResult } = require('express-validator');
const { register, login } = require('../controllers/authController'); // Import funkcji z kontrolera
const router = express.Router();

// Endpoint rejestracji użytkownika
router.post(
'/register',
  [
    body('email').isEmail().withMessage('Podaj poprawny adres e-mail'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Hasło musi mieć co najmniej 6 znaków'),
    body('name')
    .notEmpty()
    .withMessage('Imię jest wymagane')
    .matches(/^[A-Za-z]+$/)
    .withMessage('Imię może zawierać tylko litery i musi być jednoczłonowe'),
    body('age').isInt({ min: 18 }).withMessage('Strona jest przeznaczona dla osób pełnoletnich'),
    body('city').notEmpty().withMessage('Miasto jest wymagane'),
    body('profilePicture')
      .optional() // `profilePicture` jest opcjonalne
      .isURL()
      .withMessage('Podaj poprawny URL dla zdjęcia profilowego'),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next(); // Przejdź do kontrolera, jeśli walidacja się powiedzie
  },
  register
);

// Endpoint logowania użytkownika
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Podaj poprawny adres e-mail'),
    body('password').notEmpty().withMessage('Hasło jest wymagane'),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next(); // Przejdź do kontrolera, jeśli walidacja się powiedzie
  },
  login
);

module.exports = router;
