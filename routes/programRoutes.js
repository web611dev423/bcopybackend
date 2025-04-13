const express = require('express');
const router = express.Router();
const {
  create,
  getAll,
  getOne,
  update,
  delete: deleteItem,
  copy,
  acceptProgram,
  rejectProgram,
  fetchStatus
} = require('../controllers/programController');

router.post('/', create);

router.get('/', getAll);
router.get('/:id', getOne);

router.put('/:id', update);
router.put('/:id/copy', copy);

router.delete('/:id', deleteItem);

router.post('/accept', acceptProgram);
router.post('/reject', rejectProgram);
router.post('/status', fetchStatus);
module.exports = router; 