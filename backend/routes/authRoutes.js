const express = require('express');
const router = express.Router();
const { loginUser, registerUser, getUserProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/login', loginUser);
router.post('/register', registerUser); // Could be protected in real SaaS to only allow admin creation
router.get('/profile', protect, getUserProfile);

module.exports = router;
