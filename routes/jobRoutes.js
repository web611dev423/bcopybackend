const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
// const { protect, adminAuth } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');
const Job = require('../models/jobModel');

// Public routes
router.get('/', advancedResults(Job, 'recruiter'), jobController.getAllJobs);
router.get('/:id', jobController.getJob);

// Protected routes (logged in users)
// router.use(protect);
router.post('/new', jobController.createJob);

// Admin only routes
// router.use(adminAuth);
router.put('/:id', jobController.updateJob);
router.patch('/:id/status', jobController.updateJobStatus);

router.post('/accept', jobController.acceptJob);
router.post('/reject', jobController.rejectJob);
router.post('/delete', jobController.deleteJob);
router.post('/status', jobController.fetchStatus);

router.post('/pin', jobController.pinJob);
router.post('/unpin', jobController.unPinJob);

router.post('/uprank', jobController.upRankJob);
router.post('/downrank', jobController.downRankJob);

module.exports = router; 