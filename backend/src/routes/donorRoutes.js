const express = require('express');
const donorController = require('../controllers/donorController');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(requireRole('donor'));

router.get('/me', donorController.getMe);
router.patch('/me', donorController.updateProfile);
router.delete('/me', donorController.deleteProfile);
router.patch('/me/availability', donorController.toggleAvailability);
router.get('/me/history', donorController.getDonationHistory);

module.exports = router;
