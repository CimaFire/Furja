const db = require('../database/db');
const { getExchangeRates, convertCurrency, convertUserCurrency } = require('../controllers/currency.controller');
const { mockRequest, mockResponse } = require('./helpers');

jest.mock('../database/db', () => ({ query: jest.fn() }));

describe('currency.controller', () => {
  describe('getExchangeRates', () => {
    it('should return active exchange rates', async () => {
      const rates = [
        { id: 1, code: 'USD', name: 'US Dollar', rate: 1.0 },
        { id: 2, code: 'EUR', name: 'Euro', rate: 0.85 }
      ];
      db.query.mockResolvedValue({ rows: rates });
      const req = mockRequest();
      const res = mockResponse();

      await getExchangeRates(req, res);

      expect(res.json).toHaveBeenCalledWith(rates);
    });

    it('should return 500 on database error', async () => {
      db.query.mockRejectedValue(new Error('DB error'));
      const req = mockRequest();
      const res = mockResponse();

      await getExchangeRates(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to get exchange rates' });
    });
  });

  describe('convertCurrency', () => {
    it('should convert currency successfully', async () => {
      db.query.mockResolvedValue({ rows: [{ from_rate: 1.0, to_rate: 0.85 }] });
      const req = mockRequest({
        body: { fromCurrency: 'USD', toCurrency: 'EUR', amount: 100 }
      });
      const res = mockResponse();

      await convertCurrency(req, res);

      expect(res.json).toHaveBeenCalledWith({
        from: 'USD',
        to: 'EUR',
        originalAmount: 100,
        convertedAmount: '85.00',
        rate: '0.8500'
      });
    });

    it('should return 400 for invalid currencies', async () => {
      db.query.mockResolvedValue({ rows: [] });
      const req = mockRequest({
        body: { fromCurrency: 'INVALID', toCurrency: 'EUR', amount: 100 }
      });
      const res = mockResponse();

      await convertCurrency(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid currencies' });
    });

    it('should return 500 on database error', async () => {
      db.query.mockRejectedValue(new Error('DB error'));
      const req = mockRequest({
        body: { fromCurrency: 'USD', toCurrency: 'EUR', amount: 100 }
      });
      const res = mockResponse();

      await convertCurrency(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Conversion failed' });
    });
  });

  describe('convertUserCurrency', () => {
    it('should return 400 when wallet not found', async () => {
      db.query.mockResolvedValue({ rows: [] });
      const req = mockRequest({
        body: { fromCurrency: 'USD', toCurrency: 'EUR', amount: 100 },
        user: { id: 1 }
      });
      const res = mockResponse();

      await convertUserCurrency(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Wallet not found' });
    });

    it('should return 400 when insufficient balance', async () => {
      db.query.mockResolvedValue({ rows: [{ balance: 50 }] });
      const req = mockRequest({
        body: { fromCurrency: 'USD', toCurrency: 'EUR', amount: 100 },
        user: { id: 1 }
      });
      const res = mockResponse();

      await convertUserCurrency(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Insufficient balance' });
    });

    it('should convert and create new wallet when target wallet does not exist', async () => {
      db.query
        .mockResolvedValueOnce({ rows: [{ balance: 200 }] })
        .mockResolvedValueOnce({ rows: [{ from_rate: 1.0, to_rate: 0.85 }] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] });
      const req = mockRequest({
        body: { fromCurrency: 'USD', toCurrency: 'EUR', amount: 100 },
        user: { id: 1 }
      });
      const res = mockResponse();

      await convertUserCurrency(req, res);

      expect(res.json).toHaveBeenCalledWith({
        message: 'Currency converted successfully',
        from: { currency: 'USD', amount: 100 },
        to: { currency: 'EUR', amount: '85.00' }
      });
    });

    it('should convert and update existing target wallet', async () => {
      db.query
        .mockResolvedValueOnce({ rows: [{ balance: 200 }] })
        .mockResolvedValueOnce({ rows: [{ from_rate: 1.0, to_rate: 0.85 }] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ balance: 50 }] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] });
      const req = mockRequest({
        body: { fromCurrency: 'USD', toCurrency: 'EUR', amount: 100 },
        user: { id: 1 }
      });
      const res = mockResponse();

      await convertUserCurrency(req, res);

      expect(res.json).toHaveBeenCalledWith({
        message: 'Currency converted successfully',
        from: { currency: 'USD', amount: 100 },
        to: { currency: 'EUR', amount: '85.00' }
      });
    });

    it('should return 500 on database error', async () => {
      db.query.mockRejectedValue(new Error('DB error'));
      const req = mockRequest({
        body: { fromCurrency: 'USD', toCurrency: 'EUR', amount: 100 },
        user: { id: 1 }
      });
      const res = mockResponse();

      await convertUserCurrency(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
