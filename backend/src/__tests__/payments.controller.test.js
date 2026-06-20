const db = require('../database/db');
const { mockRequest, mockResponse } = require('./helpers');

jest.mock('../database/db', () => ({ query: jest.fn() }));

const mockStripe = {
  paymentIntents: {
    create: jest.fn(),
    retrieve: jest.fn()
  },
  webhooks: {
    constructEvent: jest.fn()
  }
};
jest.mock('stripe', () => jest.fn(() => mockStripe));

const { createPaymentIntent, confirmPayment, getPaymentHistory, handleWebhook } = require('../controllers/payments.controller');

describe('payments.controller', () => {
  describe('createPaymentIntent', () => {
    it('should return 400 when required fields are missing', async () => {
      const req = mockRequest({ body: { amount: 10 }, user: { id: 1 } });
      const res = mockResponse();

      await createPaymentIntent(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Missing required fields' });
    });

    it('should return 400 when amount is missing', async () => {
      const req = mockRequest({ body: { currency: 'usd' }, user: { id: 1 } });
      const res = mockResponse();

      await createPaymentIntent(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should create payment intent successfully', async () => {
      mockStripe.paymentIntents.create.mockResolvedValue({
        id: 'pi_test',
        client_secret: 'cs_test'
      });
      db.query.mockResolvedValue({ rows: [] });

      const req = mockRequest({
        body: { amount: 10, currency: 'usd' },
        user: { id: 1 }
      });
      const res = mockResponse();

      await createPaymentIntent(req, res);

      expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith({
        amount: 1000,
        currency: 'usd',
        metadata: { userId: 1 }
      });
      expect(res.json).toHaveBeenCalledWith({
        clientSecret: 'cs_test',
        paymentIntentId: 'pi_test'
      });
    });

    it('should return 500 on stripe error', async () => {
      mockStripe.paymentIntents.create.mockRejectedValue(new Error('Stripe error'));
      const req = mockRequest({
        body: { amount: 10, currency: 'usd' },
        user: { id: 1 }
      });
      const res = mockResponse();

      await createPaymentIntent(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('confirmPayment', () => {
    it('should confirm payment when succeeded', async () => {
      mockStripe.paymentIntents.retrieve.mockResolvedValue({ status: 'succeeded' });
      db.query.mockResolvedValue({ rows: [] });

      const req = mockRequest({
        body: { paymentIntentId: 'pi_test' },
        user: { id: 1 }
      });
      const res = mockResponse();

      await confirmPayment(req, res);

      expect(res.json).toHaveBeenCalledWith({ message: 'Payment confirmed', status: 'succeeded' });
    });

    it('should return 400 when payment not completed', async () => {
      mockStripe.paymentIntents.retrieve.mockResolvedValue({ status: 'pending' });

      const req = mockRequest({
        body: { paymentIntentId: 'pi_test' },
        user: { id: 1 }
      });
      const res = mockResponse();

      await confirmPayment(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Payment not completed' });
    });

    it('should return 500 on error', async () => {
      mockStripe.paymentIntents.retrieve.mockRejectedValue(new Error('Error'));

      const req = mockRequest({
        body: { paymentIntentId: 'pi_test' },
        user: { id: 1 }
      });
      const res = mockResponse();

      await confirmPayment(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getPaymentHistory', () => {
    it('should return 403 when viewing another user\'s history', async () => {
      const req = mockRequest({
        params: { userId: '2' },
        user: { id: 1 }
      });
      const res = mockResponse();

      await getPaymentHistory(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    });

    it('should return payment history for own account', async () => {
      const payments = [{ id: 1, amount: 10, currency: 'usd' }];
      db.query.mockResolvedValue({ rows: payments });

      const req = mockRequest({
        params: { userId: '1' },
        user: { id: 1 }
      });
      const res = mockResponse();

      await getPaymentHistory(req, res);

      expect(res.json).toHaveBeenCalledWith(payments);
    });
  });

  describe('handleWebhook', () => {
    it('should handle payment_intent.succeeded event', async () => {
      mockStripe.webhooks.constructEvent.mockReturnValue({
        type: 'payment_intent.succeeded',
        data: { object: { id: 'pi_test' } }
      });
      db.query.mockResolvedValue({ rows: [] });

      const req = mockRequest({
        headers: { 'stripe-signature': 'sig_test' },
        body: 'raw-body'
      });
      const res = mockResponse();

      await handleWebhook(req, res);

      expect(res.json).toHaveBeenCalledWith({ received: true });
    });

    it('should return 400 on webhook error', async () => {
      mockStripe.webhooks.constructEvent.mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      const req = mockRequest({
        headers: { 'stripe-signature': 'bad-sig' },
        body: 'raw-body'
      });
      const res = mockResponse();

      await handleWebhook(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Webhook error' });
    });
  });
});
