const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { processExcel } = require('../controllers/excelController');

router.post('/', upload.single('file'), processExcel);

module.exports = router; 