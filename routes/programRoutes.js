const express = require('express');
const router = express.Router();

const programController = require('../controllers/programController');

router.post('/', programController.create);

router.get('/', programController.getAll);
// router.get('/:id', getOne);

router.put('/:id', programController.update);
router.put('/:id/copy', programController.copy);
router.put('/:id/view', programController.view);
router.put('/:id/share', programController.share);


// router.delete('/:id', programController.deleteItem);

router.post('/accept', programController.acceptProgram);
router.post('/reject', programController.rejectProgram);
router.post('/status', programController.fetchStatus);

router.post('/pin', programController.pinProgram);
router.post('/unpin', programController.unPinProgram);

router.post('/uprank', programController.upRankProgram);
router.post('/downrank', programController.downRankProgram);

module.exports = router; 