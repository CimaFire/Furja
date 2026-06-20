const db = require('../database/db');
const { NotFoundError, UnauthorizedError, ValidationError } = require('./errors');

const findOneOrFail = async (query, params, resourceName = 'Resource') => {
  const result = await db.query(query, params);
  if (result.rows.length === 0) {
    throw new NotFoundError(resourceName);
  }
  return result.rows[0];
};

const findMany = async (query, params) => {
  const result = await db.query(query, params);
  return result.rows;
};

const checkOwnership = async (table, resourceId, userId, resourceName) => {
  const row = await findOneOrFail(
    `SELECT user_id FROM ${table} WHERE id = $1`,
    [resourceId],
    resourceName
  );
  if (row.user_id !== userId) {
    throw new UnauthorizedError();
  }
  return row;
};

const checkAgencyAdmin = async (agencyId, userId) => {
  const result = await db.query(
    'SELECT * FROM agencies WHERE id = $1 AND admin_id = $2',
    [agencyId, userId]
  );
  if (result.rows.length === 0) {
    throw new UnauthorizedError('Not authorized');
  }
  return result.rows[0];
};

const requireSelfOrFail = (reqUserId, targetUserId) => {
  if (reqUserId !== parseInt(targetUserId)) {
    throw new UnauthorizedError();
  }
};

const requireFields = (body, fields) => {
  const missing = fields.filter((f) => !body[f]);
  if (missing.length > 0) {
    throw new ValidationError('Missing required fields');
  }
};

const getWalletBalance = async (userId, currency) => {
  const result = await db.query(
    'SELECT * FROM user_wallets WHERE user_id = $1 AND currency = $2',
    [userId, currency]
  );
  return result.rows[0] || null;
};

const requireSufficientBalance = async (userId, currency, amount) => {
  const wallet = await getWalletBalance(userId, currency);
  if (!wallet || wallet.balance < amount) {
    throw new ValidationError('Insufficient balance');
  }
  return wallet;
};

const adjustWalletBalance = async (userId, currency, delta) => {
  const existing = await getWalletBalance(userId, currency);
  if (!existing) {
    await db.query(
      'INSERT INTO user_wallets (user_id, currency, balance) VALUES ($1, $2, $3)',
      [userId, currency, delta]
    );
  } else {
    await db.query(
      'UPDATE user_wallets SET balance = balance + $1 WHERE user_id = $2 AND currency = $3',
      [delta, userId, currency]
    );
  }
};

module.exports = {
  findOneOrFail,
  findMany,
  checkOwnership,
  checkAgencyAdmin,
  requireSelfOrFail,
  requireFields,
  getWalletBalance,
  requireSufficientBalance,
  adjustWalletBalance
};
