const db = require('../database/db');
const { getStreamMessages, sendMessage, deleteMessage } = require('../controllers/messages.controller');
const { mockRequest, mockResponse } = require('./helpers');

jest.mock('../database/db', () => ({ query: jest.fn() }));

describe('messages.controller', () => {
  describe('getStreamMessages', () => {
    it('should return messages with default pagination', async () => {
      const messages = [{ id: 1, content: 'Hello', username: 'user1' }];
      db.query.mockResolvedValue({ rows: messages });
      const req = mockRequest({ params: { streamId: '1' }, query: {} });
      const res = mockResponse();

      await getStreamMessages(req, res);

      expect(db.query).toHaveBeenCalledWith(
        expect.any(String),
        ['1', 50, 0]
      );
      expect(res.json).toHaveBeenCalledWith(messages);
    });

    it('should respect custom limit and offset', async () => {
      db.query.mockResolvedValue({ rows: [] });
      const req = mockRequest({
        params: { streamId: '1' },
        query: { limit: 10, offset: 20 }
      });
      const res = mockResponse();

      await getStreamMessages(req, res);

      expect(db.query).toHaveBeenCalledWith(
        expect.any(String),
        ['1', 10, 20]
      );
    });

    it('should return 500 on database error', async () => {
      db.query.mockRejectedValue(new Error('DB error'));
      const req = mockRequest({ params: { streamId: '1' }, query: {} });
      const res = mockResponse();

      await getStreamMessages(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('sendMessage', () => {
    it('should return 400 when required fields are missing', async () => {
      const req = mockRequest({ body: { content: 'Hello' }, user: { id: 1 } });
      const res = mockResponse();

      await sendMessage(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Missing required fields' });
    });

    it('should return 400 when content is missing', async () => {
      const req = mockRequest({ body: { stream_id: 1 }, user: { id: 1 } });
      const res = mockResponse();

      await sendMessage(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should send message successfully', async () => {
      const message = { id: 1, stream_id: 1, user_id: 1, content: 'Hello' };
      db.query.mockResolvedValue({ rows: [message] });
      const req = mockRequest({
        body: { stream_id: 1, content: 'Hello' },
        user: { id: 1 }
      });
      const res = mockResponse();

      await sendMessage(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(message);
    });

    it('should return 500 on database error', async () => {
      db.query.mockRejectedValue(new Error('DB error'));
      const req = mockRequest({
        body: { stream_id: 1, content: 'Hello' },
        user: { id: 1 }
      });
      const res = mockResponse();

      await sendMessage(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('deleteMessage', () => {
    it('should return 404 when message not found', async () => {
      db.query.mockResolvedValue({ rows: [] });
      const req = mockRequest({ params: { id: '999' }, user: { id: 1 } });
      const res = mockResponse();

      await deleteMessage(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Message not found' });
    });

    it('should return 403 when user does not own the message', async () => {
      db.query.mockResolvedValue({ rows: [{ user_id: 2 }] });
      const req = mockRequest({ params: { id: '1' }, user: { id: 1 } });
      const res = mockResponse();

      await deleteMessage(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    });

    it('should delete message successfully', async () => {
      db.query
        .mockResolvedValueOnce({ rows: [{ user_id: 1 }] })
        .mockResolvedValueOnce({ rows: [] });
      const req = mockRequest({ params: { id: '1' }, user: { id: 1 } });
      const res = mockResponse();

      await deleteMessage(req, res);

      expect(res.json).toHaveBeenCalledWith({ message: 'Message deleted successfully' });
    });

    it('should return 500 on database error', async () => {
      db.query.mockRejectedValue(new Error('DB error'));
      const req = mockRequest({ params: { id: '1' }, user: { id: 1 } });
      const res = mockResponse();

      await deleteMessage(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
