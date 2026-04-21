const express = require('express');
const requestController = require('../controllers/requestController');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/incoming', requireRole('donor'), requestController.listIncomingForDonor);
router.post('/:requestId/accept', requireRole('donor'), requestController.acceptRequest);
router.post('/:requestId/complete', requestController.completeDonation);
router.post('/:requestId/rate', requireRole('receiver'), requestController.rateDonor);
router.post('/:requestId/cancel', requireRole('receiver'), requestController.cancelRequest);

module.exports = router;
