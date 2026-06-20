const db = require('../database/db');
const { mockRequest, mockResponse } = require('./helpers');

jest.mock('../database/db', () => ({ query: jest.fn() }));
jest.mock('stripe', () => jest.fn(() => ({})));

const { sendGift, getStreamGifts, getUserGiftHistory } = require('../controllers/gifts.controller');

describe('gifts.controller', () => {
  describe('sendGift', () => {
    it('should return 400 when required fields are missing', async () => {
      const req = mockRequest({ body: {}, user: { id: 1 } });
      const res = mockResponse();

      await sendGift(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Missing required fields' });
    });

    it('should return 400 when stream_id is missing', async () => {
      const req = mockRequest({ body: { gift_type: 'rose' }, user: { id: 1 } });
      const res = mockResponse();

      await sendGift(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should send a rose gift with 100 points', async () => {
      const gift = { id: 1, stream_id: 1, sender_id: 1, gift_type: 'rose', points: 100 };
      db.query.mockResolvedValue({ rows: [gift] });
      const req = mockRequest({
        body: { stream_id: 1, gift_type: 'rose', amount: 1 },
        user: { id: 1 }
      });
      const res = mockResponse();

      await sendGift(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(gift);
      expect(db.query).toHaveBeenCalledWith(
        expect.any(String),
        [1, 1, 'rose', 1, 100]
      );
    });

    it('should send a diamond gift with 500 points', async () => {
      const gift = { id: 2, stream_id: 1, sender_id: 1, gift_type: 'diamond', points: 500 };
      db.query.mockResolvedValue({ rows: [gift] });
      const req = mockRequest({
        body: { stream_id: 1, gift_type: 'diamond', amount: 1 },
        user: { id: 1 }
      });
      const res = mockResponse();

      await sendGift(req, res);

      expect(db.query).toHaveBeenCalledWith(
        expect.any(String),
        [1, 1, 'diamond', 1, 500]
      );
    });

    it('should send a crown gift with 1000 points', async () => {
      db.query.mockResolvedValue({ rows: [{ id: 3 }] });
      const req = mockRequest({
        body: { stream_id: 1, gift_type: 'crown', amount: 1 },
        user: { id: 1 }
      });
      const res = mockResponse();

      await sendGift(req, res);

      expect(db.query).toHaveBeenCalledWith(
        expect.any(String),
        [1, 1, 'crown', 1, 1000]
      );
    });

    it('should send an airplane gift with 5000 points', async () => {
      db.query.mockResolvedValue({ rows: [{ id: 4 }] });
      const req = mockRequest({
        body: { stream_id: 1, gift_type: 'airplane', amount: 1 },
        user: { id: 1 }
      });
      const res = mockResponse();

      await sendGift(req, res);

      expect(db.query).toHaveBeenCalledWith(
        expect.any(String),
        [1, 1, 'airplane', 1, 5000]
      );
    });

    it('should default to 100 points for unknown gift type', async () => {
      db.query.mockResolvedValue({ rows: [{ id: 5 }] });
      const req = mockRequest({
        body: { stream_id: 1, gift_type: 'unknown', amount: 1 },
        user: { id: 1 }
      });
      const res = mockResponse();

      await sendGift(req, res);

      expect(db.query).toHaveBeenCalledWith(
        expect.any(String),
        [1, 1, 'unknown', 1, 100]
      );
    });

    it('should return 500 on database error', async () => {
      db.query.mockRejectedValue(new Error('DB error'));
      const req = mockRequest({
        body: { stream_id: 1, gift_type: 'rose', amount: 1 },
        user: { id: 1 }
      });
      const res = mockResponse();

      await sendGift(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getStreamGifts', () => {
    it('should return stream gifts', async () => {
      const gifts = [{ id: 1, gift_type: 'rose', username: 'user1' }];
      db.query.mockResolvedValue({ rows: gifts });
      const req = mockRequest({ params: { streamId: '1' } });
      const res = mockResponse();

      await getStreamGifts(req, res);

      expect(res.json).toHaveBeenCalledWith(gifts);
    });

    it('should return empty array when no gifts', async () => {
      db.query.mockResolvedValue({ rows: [] });
      const req = mockRequest({ params: { streamId: '1' } });
      const res = mockResponse();

      await getStreamGifts(req, res);

      expect(res.json).toHaveBeenCalledWith([]);
    });

    it('should return 500 on database error', async () => {
      db.query.mockRejectedValue(new Error('DB error'));
      const req = mockRequest({ params: { streamId: '1' } });
      const res = mockResponse();

      await getStreamGifts(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getUserGiftHistory', () => {
    it('should return user gift history', async () => {
      const gifts = [{ id: 1, gift_type: 'diamond', stream_title: 'Stream 1' }];
      db.query.mockResolvedValue({ rows: gifts });
      const req = mockRequest({ params: { userId: '1' } });
      const res = mockResponse();

      await getUserGiftHistory(req, res);

      expect(res.json).toHaveBeenCalledWith(gifts);
    });

    it('should return 500 on database error', async () => {
      db.query.mockRejectedValue(new Error('DB error'));
      const req = mockRequest({ params: { userId: '1' } });
      const res = mockResponse();

      await getUserGiftHistory(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
