const express = require('express');
const { body, validationResult } = require('express-validator');
const { register, login, resetPassword, updateProfile, deleteAccount, logout } = require('../controllers/authController'); // Import funkcji z kontrolera
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const logActivity = require('../middleware/logActivityMiddleware');
const multer = require('multer');
const path = require('path');
const db = require('../config/db'); // Twój plik konfiguracyjny z połączeniem do MySQL

//debugowanie: sorawdzenie typów zaimportowanych funkcji
console.log('register type:', typeof register);
console.log('login type:', typeof login);
console.log('resetPassword type:', typeof resetPassword);
console.log('updateProfile type:', typeof updateProfile);
console.log('deleteAccount type:', typeof deleteAccount);
console.log('logout type:', typeof logout);

// Konfiguracja multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Folder do przechowywania zdjęć
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unikalna nazwa pliku
  },
});

const upload = multer({ storage });

// Endpoint rejestracji użytkownika
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Rejestracja nowego użytkownika
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *               age:
 *                 type: integer
 *               city:
 *                 type: string
 *               profilePicture:
 *                 type: string
 *     responses:
 *       201:
 *         description: Użytkownik został zarejestrowany
 *       400:
 *         description: Błąd walidacji
 */
router.post(
  '/register',
  upload.single('profilePicture'),
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
    body('city').notEmpty().withMessage('Miasto jest wymagane')
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  logActivity, register
);

// Endpoint logowania użytkownika
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Logowanie użytkownika
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *               age:
 *                 type: integer
 *               city:
 *                 type: string
 *               profilePicture:
 *                 type: string
 *     responses:
 *       201:
 *         description: Użytkownik został zalogowany
 *       400:
 *         description: Błąd walidacji
 */
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
  logActivity, login
);

//Endpoint resetowania hasła
/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Zmiana hasła użytkownika
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *               age:
 *                 type: integer
 *               city:
 *                 type: string
 *               profilePicture:
 *                 type: string
 *     responses:
 *       201:
 *         description: Użytkownik zmienił hasło
 *       400:
 *         description: Błąd walidacji
 */
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
/**
 * @swagger
 * /api/auth/update-profile:
 *   post:
 *     summary: Aktualizacja profilu użytkownika
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *               age:
 *                 type: integer
 *               city:
 *                 type: string
 *               profilePicture:
 *                 type: string
 *     responses:
 *       201:
 *         description: Profil został zaktualizowany
 *       400:
 *         description: Błąd walidacji
 */
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
/**
 * @swagger
 * /api/auth/delete-account:
 *   post:
 *     summary: Usunięcie konta użytkownika
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *               age:
 *                 type: integer
 *               city:
 *                 type: string
 *               profilePicture:
 *                 type: string
 *     responses:
 *       201:
 *         description: Użytkownik został usunięty
 *       400:
 *         description: Błąd walidacji
 */
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

// Endpoint wylogowania użytkownika
/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Wylogowanie użytkownika
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *               age:
 *                 type: integer
 *               city:
 *                 type: string
 *               profilePicture:
 *                 type: string
 *     responses:
 *       201:
 *         description: Użytkownik został wylogowany
 *       400:
 *         description: Błąd walidacji
 */
router.post('/logout', authMiddleware, logout);


module.exports = router;
