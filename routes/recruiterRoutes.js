const express = require('express');
const router = express.Router();
const recruiterController = require('../controllers/recruiterController');
const { protect, adminAuth } = require('../middleware/auth');

// Public routes
router.get('/', recruiterController.getAllRecruiters);
router.get('/:id', recruiterController.getRecruiter);

// Protected routes
// router.use(protect);
router.post('/', recruiterController.createRecruiter);

// Admin routes
// router.use(adminAuth);
router.put('/:id', recruiterController.updateRecruiter);
router.delete('/:id', recruiterController.deleteRecruiter);

router.post('/pin', recruiterController.pinRecruiter);
router.post('/unpin', recruiterController.unPinRecruiter);

router.post('/uprank', recruiterController.upRankRecruiter);
router.post('/downrank', recruiterController.downRankRecruiter);

module.exports = router; 