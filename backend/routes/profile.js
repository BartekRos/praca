const express = require('express');
const router = express.Router();
const { getUserProfile } = require('../controllers/profileController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/:userId', authenticateToken, getUserProfile);

module.exports = router;
