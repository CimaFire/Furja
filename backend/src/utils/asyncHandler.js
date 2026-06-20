const { AppError } = require('./errors');

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((error) => {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  });
};

module.exports = asyncHandler;
