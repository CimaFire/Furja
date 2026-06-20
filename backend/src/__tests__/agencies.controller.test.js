const db = require('../database/db');
const { mockRequest, mockResponse } = require('./helpers');

jest.mock('../database/db', () => ({ query: jest.fn() }));

const mockStripe = {
  payouts: { create: jest.fn() }
};
jest.mock('stripe', () => jest.fn(() => mockStripe));

const { registerAgency, getAgency, addBroadcaster, getAgencyBroadcasters, getAgencyEarnings, withdrawEarnings } = require('../controllers/agencies.controller');

describe('agencies.controller', () => {
  describe('registerAgency', () => {
    it('should return 400 when user already has an agency', async () => {
      db.query.mockResolvedValue({ rows: [{ id: 1 }] });
      const req = mockRequest({
        body: { agencyName: 'Test', agencyType: 'media', businessRegistration: '123', contactEmail: 'a@b.com' },
        user: { id: 1 }
      });
      const res = mockResponse();

      await registerAgency(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'User already has an agency' });
    });

    it('should register agency successfully', async () => {
      const agency = { id: 1, name: 'Test', status: 'pending', commission_rate: 0.15 };
      db.query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [agency] });
      const req = mockRequest({
        body: { agencyName: 'Test', agencyType: 'media', businessRegistration: '123', contactEmail: 'a@b.com' },
        user: { id: 1 }
      });
      const res = mockResponse();

      await registerAgency(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Agency registered successfully',
        agency
      });
    });

    it('should return 500 on database error', async () => {
      db.query.mockRejectedValue(new Error('DB error'));
      const req = mockRequest({
        body: { agencyName: 'Test' },
        user: { id: 1 }
      });
      const res = mockResponse();

      await registerAgency(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getAgency', () => {
    it('should return agency when found', async () => {
      const agency = { id: 1, name: 'Test Agency' };
      db.query.mockResolvedValue({ rows: [agency] });
      const req = mockRequest({ params: { agencyId: '1' } });
      const res = mockResponse();

      await getAgency(req, res);

      expect(res.json).toHaveBeenCalledWith(agency);
    });

    it('should return 404 when agency not found', async () => {
      db.query.mockResolvedValue({ rows: [] });
      const req = mockRequest({ params: { agencyId: '999' } });
      const res = mockResponse();

      await getAgency(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Agency not found' });
    });

    it('should return 500 on database error', async () => {
      db.query.mockRejectedValue(new Error('DB error'));
      const req = mockRequest({ params: { agencyId: '1' } });
      const res = mockResponse();

      await getAgency(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('addBroadcaster', () => {
    it('should return 403 when user is not agency admin', async () => {
      db.query.mockResolvedValue({ rows: [] });
      const req = mockRequest({
        body: { agencyId: 1, broadcasterId: 2, contractType: 'full-time' },
        user: { id: 99 }
      });
      const res = mockResponse();

      await addBroadcaster(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Not authorized to add broadcasters' });
    });

    it('should add broadcaster successfully', async () => {
      const broadcasterAgency = { id: 1, agency_id: 1, broadcaster_id: 2, status: 'active' };
      db.query
        .mockResolvedValueOnce({ rows: [{ id: 1, admin_id: 1 }] })
        .mockResolvedValueOnce({ rows: [broadcasterAgency] });
      const req = mockRequest({
        body: { agencyId: 1, broadcasterId: 2, contractType: 'full-time' },
        user: { id: 1 }
      });
      const res = mockResponse();

      await addBroadcaster(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Broadcaster added to agency',
        broadcasterAgency
      });
    });

    it('should return 500 on database error', async () => {
      db.query.mockRejectedValue(new Error('DB error'));
      const req = mockRequest({
        body: { agencyId: 1, broadcasterId: 2, contractType: 'full-time' },
        user: { id: 1 }
      });
      const res = mockResponse();

      await addBroadcaster(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getAgencyBroadcasters', () => {
    it('should return agency broadcasters', async () => {
      const broadcasters = [{ id: 1, username: 'broadcaster1' }];
      db.query.mockResolvedValue({ rows: broadcasters });
      const req = mockRequest({ params: { agencyId: '1' } });
      const res = mockResponse();

      await getAgencyBroadcasters(req, res);

      expect(res.json).toHaveBeenCalledWith(broadcasters);
    });

    it('should return 500 on database error', async () => {
      db.query.mockRejectedValue(new Error('DB error'));
      const req = mockRequest({ params: { agencyId: '1' } });
      const res = mockResponse();

      await getAgencyBroadcasters(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getAgencyEarnings', () => {
    it('should return 403 when user is not agency admin', async () => {
      db.query.mockResolvedValue({ rows: [] });
      const req = mockRequest({
        params: { agencyId: '1' },
        user: { id: 99 }
      });
      const res = mockResponse();

      await getAgencyEarnings(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Not authorized' });
    });

    it('should return earnings for agency admin', async () => {
      const earnings = [{ date: '2024-01-01', transactions: 5, total_amount: 500 }];
      db.query
        .mockResolvedValueOnce({ rows: [{ id: 1, admin_id: 1 }] })
        .mockResolvedValueOnce({ rows: earnings });
      const req = mockRequest({
        params: { agencyId: '1' },
        user: { id: 1 }
      });
      const res = mockResponse();

      await getAgencyEarnings(req, res);

      expect(res.json).toHaveBeenCalledWith(earnings);
    });

    it('should return 500 on database error', async () => {
      db.query.mockRejectedValue(new Error('DB error'));
      const req = mockRequest({
        params: { agencyId: '1' },
        user: { id: 1 }
      });
      const res = mockResponse();

      await getAgencyEarnings(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('withdrawEarnings', () => {
    it('should return 403 when user is not agency admin', async () => {
      db.query.mockResolvedValue({ rows: [] });
      const req = mockRequest({
        body: { agencyId: 1, amount: 100 },
        user: { id: 99 }
      });
      const res = mockResponse();

      await withdrawEarnings(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('should return 400 when insufficient earnings', async () => {
      db.query
        .mockResolvedValueOnce({ rows: [{ id: 1, admin_id: 1 }] })
        .mockResolvedValueOnce({ rows: [{ total: 50 }] });
      const req = mockRequest({
        body: { agencyId: 1, amount: 100 },
        user: { id: 1 }
      });
      const res = mockResponse();

      await withdrawEarnings(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Insufficient earnings' });
    });

    it('should withdraw earnings successfully', async () => {
      const payout = { id: 'po_test', amount: 10000 };
      db.query
        .mockResolvedValueOnce({ rows: [{ id: 1, admin_id: 1 }] })
        .mockResolvedValueOnce({ rows: [{ total: 200 }] })
        .mockResolvedValueOnce({ rows: [] });
      mockStripe.payouts.create.mockResolvedValue(payout);
      const req = mockRequest({
        body: { agencyId: 1, amount: 100 },
        user: { id: 1 }
      });
      const res = mockResponse();

      await withdrawEarnings(req, res);

      expect(mockStripe.payouts.create).toHaveBeenCalledWith({
        amount: 10000,
        currency: 'usd'
      });
      expect(res.json).toHaveBeenCalledWith({
        message: 'Withdrawal successful',
        payout
      });
    });

    it('should return 500 on stripe error', async () => {
      db.query
        .mockResolvedValueOnce({ rows: [{ id: 1, admin_id: 1 }] })
        .mockResolvedValueOnce({ rows: [{ total: 200 }] });
      mockStripe.payouts.create.mockRejectedValue(new Error('Stripe error'));
      const req = mockRequest({
        body: { agencyId: 1, amount: 100 },
        user: { id: 1 }
      });
      const res = mockResponse();

      await withdrawEarnings(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
