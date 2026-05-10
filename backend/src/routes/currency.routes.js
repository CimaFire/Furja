// Currency Routes
const express = require('express');
const currencyController = require('../controllers/currency.controller');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/rates', currencyController.getExchangeRates);
router.post('/convert', currencyController.convertCurrency);
router.post('/user/convert', auth, currencyController.convertUserCurrency);

module.exports = router;
