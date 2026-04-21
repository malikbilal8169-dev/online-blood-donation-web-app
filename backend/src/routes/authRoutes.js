const express = require('express');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register/donor', authController.registerDonor);
router.post('/register/receiver', authController.registerReceiver);
router.post('/login', authController.login);
router.get('/me', protect, authController.getMe);

module.exports = router;
