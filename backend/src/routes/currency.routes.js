const express = require('express');
const currencyController = require('../controllers/currency.controller');
const { validateToken } = require('../middleware/auth.middleware');
const router = express.Router();

router.get('/rates', currencyController.getExchangeRates);
router.post('/convert', currencyController.convertCurrency);
router.post('/user/convert', validateToken, currencyController.convertUserCurrency);

module.exports = router;
