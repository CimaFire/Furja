const db = require('../database/db');

// Get exchange rates
const getExchangeRates = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM currency_exchange WHERE is_active = true ORDER BY name ASC'
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get exchange rates' });
  }
};

// Convert currency
const convertCurrency = async (req, res) => {
  try {
    const { fromCurrency, toCurrency, amount } = req.body;

    // Get rates
    const result = await db.query(
      `SELECT ce1.rate as from_rate, ce2.rate as to_rate
       FROM currency_exchange ce1, currency_exchange ce2
       WHERE ce1.code = $1 AND ce2.code = $2 AND ce1.is_active = true AND ce2.is_active = true`,
      [fromCurrency, toCurrency]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid currencies' });
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
  } catch (error) {
    res.status(500).json({ error: 'Conversion failed' });
  }
};

// User wallet conversion
const convertUserCurrency = async (req, res) => {
  try {
    const { fromCurrency, toCurrency, amount } = req.body;
    const userId = req.user.id;

    // Get user wallet
    const walletResult = await db.query(
      'SELECT * FROM user_wallets WHERE user_id = $1 AND currency = $2',
      [userId, fromCurrency]
    );

    if (walletResult.rows.length === 0) {
      return res.status(400).json({ error: 'Wallet not found' });
    }

    const wallet = walletResult.rows[0];
    if (wallet.balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Get conversion rate
    const rateResult = await db.query(
      `SELECT ce1.rate as from_rate, ce2.rate as to_rate
       FROM currency_exchange ce1, currency_exchange ce2
       WHERE ce1.code = $1 AND ce2.code = $2`,
      [fromCurrency, toCurrency]
    );

    const { from_rate, to_rate } = rateResult.rows[0];
    const convertedAmount = (amount / from_rate) * to_rate;

    // Update wallets
    await db.query(
      'UPDATE user_wallets SET balance = balance - $1 WHERE user_id = $2 AND currency = $3',
      [amount, userId, fromCurrency]
    );

    const toWalletResult = await db.query(
      'SELECT * FROM user_wallets WHERE user_id = $1 AND currency = $2',
      [userId, toCurrency]
    );

    if (toWalletResult.rows.length === 0) {
      await db.query(
        'INSERT INTO user_wallets (user_id, currency, balance) VALUES ($1, $2, $3)',
        [userId, toCurrency, convertedAmount]
      );
    } else {
      await db.query(
        'UPDATE user_wallets SET balance = balance + $1 WHERE user_id = $2 AND currency = $3',
        [convertedAmount, userId, toCurrency]
      );
    }

    // Log transaction
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
  } catch (error) {
    res.status(500).json({ error: 'Conversion failed' });
  }
};

module.exports = {
  getExchangeRates,
  convertCurrency,
  convertUserCurrency
};
