const express = require('express');
const { body, validationResult } = require('express-validator');
const { register, login, resetPassword, updateProfile, deleteAccount } = require('../controllers/authController'); // Import funkcji z kontrolera
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');

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

//Endpoint resetowania hasła
router.post(
  '/reset-password',
  [
    body('email').isEmail().withMessage('Podaj poprawny adres e-mail'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('Nowe hasło musi mieć co najmniej 6 znaków'),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  resetPassword
);

//Endpoint aktualizacji profilu
router.put(
  '/update-profile',
  [
    body('city').optional().notEmpty().withMessage('Miasto nie może być puste'),
    body('profilePicture').optional().isURL().withMessage('Zdjęcie profilowe musi być poprawnym URL-em'),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  authMiddleware, updateProfile
);

//Endpoint usuwania konta
router.delete(
  '/delete-account',
  [
    body('password').notEmpty().withMessage('Hasło jest wymagane'),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  authMiddleware, deleteAccount
);

module.exports = router;
