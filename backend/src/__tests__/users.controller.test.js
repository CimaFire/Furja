const db = require('../database/db');
const { getUserById, updateUser, getUserStreams, getUserFollowers, followUser, unfollowUser } = require('../controllers/users.controller');
const { mockRequest, mockResponse } = require('./helpers');

jest.mock('../database/db', () => ({ query: jest.fn() }));

describe('users.controller', () => {
  describe('getUserById', () => {
    it('should return user when found', async () => {
      const user = { id: 1, username: 'test', email: 'test@test.com' };
      db.query.mockResolvedValue({ rows: [user] });
      const req = mockRequest({ params: { id: '1' } });
      const res = mockResponse();

      await getUserById(req, res);

      expect(res.json).toHaveBeenCalledWith(user);
    });

    it('should return 404 when user not found', async () => {
      db.query.mockResolvedValue({ rows: [] });
      const req = mockRequest({ params: { id: '999' } });
      const res = mockResponse();

      await getUserById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });

    it('should return 500 on database error', async () => {
      db.query.mockRejectedValue(new Error('DB error'));
      const req = mockRequest({ params: { id: '1' } });
      const res = mockResponse();

      await getUserById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('updateUser', () => {
    it('should return 403 when user tries to update another profile', async () => {
      const req = mockRequest({
        params: { id: '2' },
        user: { id: 1 },
        body: { first_name: 'Test' }
      });
      const res = mockResponse();

      await updateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    });

    it('should update user successfully', async () => {
      const updatedUser = { id: 1, first_name: 'New', last_name: 'Name', bio: 'Bio', avatar_url: null };
      db.query.mockResolvedValue({ rows: [updatedUser] });
      const req = mockRequest({
        params: { id: '1' },
        user: { id: 1 },
        body: { first_name: 'New', last_name: 'Name', bio: 'Bio', avatar_url: null }
      });
      const res = mockResponse();

      await updateUser(req, res);

      expect(res.json).toHaveBeenCalledWith(updatedUser);
    });

    it('should return 500 on database error', async () => {
      db.query.mockRejectedValue(new Error('DB error'));
      const req = mockRequest({
        params: { id: '1' },
        user: { id: 1 },
        body: { first_name: 'New' }
      });
      const res = mockResponse();

      await updateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getUserStreams', () => {
    it('should return user streams', async () => {
      const streams = [{ id: 1, title: 'Stream 1' }];
      db.query.mockResolvedValue({ rows: streams });
      const req = mockRequest({ params: { id: '1' } });
      const res = mockResponse();

      await getUserStreams(req, res);

      expect(res.json).toHaveBeenCalledWith(streams);
    });

    it('should return empty array when no streams', async () => {
      db.query.mockResolvedValue({ rows: [] });
      const req = mockRequest({ params: { id: '1' } });
      const res = mockResponse();

      await getUserStreams(req, res);

      expect(res.json).toHaveBeenCalledWith([]);
    });
  });

  describe('getUserFollowers', () => {
    it('should return user followers', async () => {
      const followers = [{ id: 2, username: 'follower1' }];
      db.query.mockResolvedValue({ rows: followers });
      const req = mockRequest({ params: { id: '1' } });
      const res = mockResponse();

      await getUserFollowers(req, res);

      expect(res.json).toHaveBeenCalledWith(followers);
    });
  });

  describe('followUser', () => {
    it('should return 400 when trying to follow yourself', async () => {
      const req = mockRequest({ params: { id: '1' }, user: { id: 1 } });
      const res = mockResponse();

      await followUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Cannot follow yourself' });
    });

    it('should return 400 when already following', async () => {
      db.query.mockResolvedValue({ rows: [{ id: 1 }] });
      const req = mockRequest({ params: { id: '2' }, user: { id: 1 } });
      const res = mockResponse();

      await followUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Already following this user' });
    });

    it('should follow user successfully', async () => {
      db.query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] });
      const req = mockRequest({ params: { id: '2' }, user: { id: 1 } });
      const res = mockResponse();

      await followUser(req, res);

      expect(res.json).toHaveBeenCalledWith({ message: 'Followed successfully' });
    });

    it('should return 500 on database error', async () => {
      db.query.mockRejectedValue(new Error('DB error'));
      const req = mockRequest({ params: { id: '2' }, user: { id: 1 } });
      const res = mockResponse();

      await followUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('unfollowUser', () => {
    it('should unfollow user successfully', async () => {
      db.query.mockResolvedValue({ rows: [] });
      const req = mockRequest({ params: { id: '2' }, user: { id: 1 } });
      const res = mockResponse();

      await unfollowUser(req, res);

      expect(res.json).toHaveBeenCalledWith({ message: 'Unfollowed successfully' });
    });

    it('should return 500 on database error', async () => {
      db.query.mockRejectedValue(new Error('DB error'));
      const req = mockRequest({ params: { id: '2' }, user: { id: 1 } });
      const res = mockResponse();

      await unfollowUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
