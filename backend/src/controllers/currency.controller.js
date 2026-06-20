const db = require('../database/db');
const asyncHandler = require('../utils/asyncHandler');
const { findMany, requireSufficientBalance, adjustWalletBalance } = require('../utils/db.helpers');
const { ValidationError } = require('../utils/errors');

// Get exchange rates
const getExchangeRates = asyncHandler(async (req, res) => {
  const rates = await findMany(
    'SELECT * FROM currency_exchange WHERE is_active = true ORDER BY name ASC'
  );

  res.json(rates);
});

// Convert currency
const convertCurrency = asyncHandler(async (req, res) => {
  const { fromCurrency, toCurrency, amount } = req.body;

  const result = await db.query(
    `SELECT ce1.rate as from_rate, ce2.rate as to_rate
     FROM currency_exchange ce1, currency_exchange ce2
     WHERE ce1.code = $1 AND ce2.code = $2 AND ce1.is_active = true AND ce2.is_active = true`,
    [fromCurrency, toCurrency]
  );

  if (result.rows.length === 0) {
    throw new ValidationError('Invalid currencies');
  }

  const { from_rate, to_rate } = result.rows[0];
  const convertedAmount = (amount / from_rate) * to_rate;

  res.json({
    from: fromCurrency,
    to: toCurrency,
    originalAmount: amount,
    convertedAmount: convertedAmount.toFixed(2),
    rate: (to_rate / from_rate).toFixed(4)
  });
});

// User wallet conversion
const convertUserCurrency = asyncHandler(async (req, res) => {
  const { fromCurrency, toCurrency, amount } = req.body;
  const userId = req.user.id;

  await requireSufficientBalance(userId, fromCurrency, amount);

  const rateResult = await db.query(
    `SELECT ce1.rate as from_rate, ce2.rate as to_rate
     FROM currency_exchange ce1, currency_exchange ce2
     WHERE ce1.code = $1 AND ce2.code = $2`,
    [fromCurrency, toCurrency]
  );

  const { from_rate, to_rate } = rateResult.rows[0];
  const convertedAmount = (amount / from_rate) * to_rate;

  await adjustWalletBalance(userId, fromCurrency, -amount);
  await adjustWalletBalance(userId, toCurrency, convertedAmount);

  await db.query(
    `INSERT INTO currency_transactions (user_id, from_currency, to_currency, from_amount, to_amount, rate)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [userId, fromCurrency, toCurrency, amount, convertedAmount, to_rate / from_rate]
  );

  res.json({
    message: 'Currency converted successfully',
    from: { currency: fromCurrency, amount: amount },
    to: { currency: toCurrency, amount: convertedAmount.toFixed(2) }
  });
});

module.exports = { getExchangeRates, convertCurrency, convertUserCurrency };
