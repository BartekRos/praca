const express = require('express');
const router = express.Router();
const { getUserProfile } = require('../controllers/usersController');
console.log('getUserProfile is:', getUserProfile);
const { authMiddleware } = require('../middleware/authMiddleware');

router.get('/profile', authMiddleware, getUserProfile);


module.exports = router;
