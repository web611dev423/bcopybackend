const express = require('express');
const router = express.Router();
const contributionController = require('../controllers/contributionController');
const { protect, adminAuth } = require('../middleware/auth');

// Public routes
router.get('/', contributionController.getAllContributions);
router.get('/:id', contributionController.getContribution);

// Protected routes
// router.use(protect);
router.post('/new', contributionController.createContribution);

// Admin routes
// router.use(adminAuth);
router.put('/:id', contributionController.updateContribution);
router.delete('/:id', contributionController.deleteContribution);
router.patch('/:id/status', contributionController.updateContributionStatus);

router.post('/accept', contributionController.acceptContribution);
router.post('/reject', contributionController.rejectContribution);
router.post('/status', contributionController.fetchStatus);

module.exports = router; 