const express = require('express');
const router = express.Router();
const contributorController = require('../controllers/contributorController');
const { adminAuth } = require('../middleware/auth');

// Public routes
router.get('/', contributorController.getAllContributors);
router.get('/:id', contributorController.getContributor);

// Protected routes
// router.use(adminAuth);
router.post('/', contributorController.createContributor);
router.put('/:id', contributorController.updateContributor);
router.delete('/:id', contributorController.deleteContributor);

router.post('/pin', contributorController.pinContributor);
router.post('/unpin', contributorController.unPinContributor);

router.post('/uprank', contributorController.upRankContributor);
router.post('/downrank', contributorController.downRankContributor);

module.exports = router; 