const express = require('express');
const router = express.Router();
const settlementController = require('../controllers/settlementController');

// GET /api/settlements - Get settlement summary
router.get('/', settlementController.getSettlements);

// GET /api/balances - Get all balances
router.get('/balances', settlementController.getBalances);

module.exports = router;