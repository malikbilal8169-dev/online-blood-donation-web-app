const express = require('express');
const receiverController = require('../controllers/receiverController');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(requireRole('receiver'));

router.get('/search', receiverController.searchDonors);
router.post('/requests', receiverController.createRequest);
router.get('/requests', receiverController.getMyRequest);

module.exports = router;
