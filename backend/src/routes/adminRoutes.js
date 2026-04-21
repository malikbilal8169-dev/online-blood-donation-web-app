const express = require('express');
const { protect, requireRole } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

const router = express.Router();

// All admin routes require authenticated admin user
router.use(protect);
router.use(requireRole('admin'));

router.get('/stats', adminController.getStats);
router.get('/users', adminController.listUsers);
router.patch('/users/:userId', adminController.updateUserFlags);

router.get('/requests/active', adminController.listActiveRequests);
router.post('/requests/:requestId/review', adminController.reviewRequest);

module.exports = router;

