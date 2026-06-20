const crypto = require('crypto');
const db = require('../database/db');
const { getAllStreams, getStreamById, createStream, updateStream, endStream, getStreamAnalytics } = require('../controllers/streams.controller');
const { mockRequest, mockResponse } = require('./helpers');

jest.mock('../database/db', () => ({ query: jest.fn() }));
jest.mock('crypto', () => ({
  randomBytes: jest.fn(() => ({
    toString: jest.fn(() => 'abcdef1234567890abcdef1234567890')
  }))
}));

describe('streams.controller', () => {
  describe('getAllStreams', () => {
    it('should return all active streams', async () => {
      const streams = [
        { id: 1, title: 'Stream 1', username: 'user1', viewer_count: 100 },
        { id: 2, title: 'Stream 2', username: 'user2', viewer_count: 50 }
      ];
      db.query.mockResolvedValue({ rows: streams });
      const req = mockRequest();
      const res = mockResponse();

      await getAllStreams(req, res);

      expect(res.json).toHaveBeenCalledWith(streams);
    });

    it('should return empty array when no streams', async () => {
      db.query.mockResolvedValue({ rows: [] });
      const req = mockRequest();
      const res = mockResponse();

      await getAllStreams(req, res);

      expect(res.json).toHaveBeenCalledWith([]);
    });

    it('should return 500 on database error', async () => {
      db.query.mockRejectedValue(new Error('DB error'));
      const req = mockRequest();
      const res = mockResponse();

      await getAllStreams(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getStreamById', () => {
    it('should return stream when found', async () => {
      const stream = { id: 1, title: 'Stream 1', username: 'user1' };
      db.query.mockResolvedValue({ rows: [stream] });
      const req = mockRequest({ params: { id: '1' } });
      const res = mockResponse();

      await getStreamById(req, res);

      expect(res.json).toHaveBeenCalledWith(stream);
    });

    it('should return 404 when stream not found', async () => {
      db.query.mockResolvedValue({ rows: [] });
      const req = mockRequest({ params: { id: '999' } });
      const res = mockResponse();

      await getStreamById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Stream not found' });
    });

    it('should return 500 on database error', async () => {
      db.query.mockRejectedValue(new Error('DB error'));
      const req = mockRequest({ params: { id: '1' } });
      const res = mockResponse();

      await getStreamById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('createStream', () => {
    it('should return 400 when title is missing', async () => {
      const req = mockRequest({ body: {}, user: { id: 1 } });
      const res = mockResponse();

      await createStream(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Title is required' });
    });

    it('should create stream successfully', async () => {
      const newStream = { id: 1, user_id: 1, title: 'Test Stream', stream_key: 'abc123', status: 'scheduled' };
      db.query.mockResolvedValue({ rows: [newStream] });
      const req = mockRequest({
        body: { title: 'Test Stream', description: 'Testing' },
        user: { id: 1 }
      });
      const res = mockResponse();

      await createStream(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(newStream);
    });

    it('should return 500 on database error', async () => {
      db.query.mockRejectedValue(new Error('DB error'));
      const req = mockRequest({
        body: { title: 'Test Stream' },
        user: { id: 1 }
      });
      const res = mockResponse();

      await createStream(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('updateStream', () => {
    it('should return 404 when stream not found', async () => {
      db.query.mockResolvedValue({ rows: [] });
      const req = mockRequest({
        params: { id: '999' },
        body: { title: 'Updated' },
        user: { id: 1 }
      });
      const res = mockResponse();

      await updateStream(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return 403 when user does not own the stream', async () => {
      db.query.mockResolvedValue({ rows: [{ user_id: 2 }] });
      const req = mockRequest({
        params: { id: '1' },
        body: { title: 'Updated' },
        user: { id: 1 }
      });
      const res = mockResponse();

      await updateStream(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    });

    it('should update stream successfully', async () => {
      const updatedStream = { id: 1, title: 'Updated', user_id: 1 };
      db.query
        .mockResolvedValueOnce({ rows: [{ user_id: 1 }] })
        .mockResolvedValueOnce({ rows: [updatedStream] });
      const req = mockRequest({
        params: { id: '1' },
        body: { title: 'Updated' },
        user: { id: 1 }
      });
      const res = mockResponse();

      await updateStream(req, res);

      expect(res.json).toHaveBeenCalledWith(updatedStream);
    });
  });

  describe('endStream', () => {
    it('should return 404 when stream not found', async () => {
      db.query.mockResolvedValue({ rows: [] });
      const req = mockRequest({ params: { id: '999' }, user: { id: 1 } });
      const res = mockResponse();

      await endStream(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return 403 when user does not own the stream', async () => {
      db.query.mockResolvedValue({ rows: [{ user_id: 2, started_at: new Date() }] });
      const req = mockRequest({ params: { id: '1' }, user: { id: 1 } });
      const res = mockResponse();

      await endStream(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('should end stream successfully', async () => {
      const endedStream = { id: 1, status: 'ended', user_id: 1 };
      db.query
        .mockResolvedValueOnce({ rows: [{ user_id: 1, started_at: new Date(Date.now() - 3600000) }] })
        .mockResolvedValueOnce({ rows: [endedStream] });
      const req = mockRequest({ params: { id: '1' }, user: { id: 1 } });
      const res = mockResponse();

      await endStream(req, res);

      expect(res.json).toHaveBeenCalledWith(endedStream);
    });
  });

  describe('getStreamAnalytics', () => {
    it('should return analytics data', async () => {
      const analytics = { stream_id: 1, views: 1000, likes: 50 };
      db.query.mockResolvedValue({ rows: [analytics] });
      const req = mockRequest({ params: { id: '1' } });
      const res = mockResponse();

      await getStreamAnalytics(req, res);

      expect(res.json).toHaveBeenCalledWith(analytics);
    });

    it('should return 404 when no analytics found', async () => {
      db.query.mockResolvedValue({ rows: [] });
      const req = mockRequest({ params: { id: '999' } });
      const res = mockResponse();

      await getStreamAnalytics(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'No analytics found' });
    });
  });
});
