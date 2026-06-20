const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../database/db');
const { register, login, refreshToken, logout, getCurrentUser } = require('../controllers/auth.controller');
const { mockRequest, mockResponse } = require('./helpers');

jest.mock('jsonwebtoken');
jest.mock('bcryptjs');
jest.mock('../database/db', () => ({ query: jest.fn() }));

describe('auth.controller', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_EXPIRE = '7d';
    process.env.REFRESH_TOKEN_SECRET = 'refresh-secret';
  });

  describe('register', () => {
    it('should return 400 when required fields are missing', async () => {
      const req = mockRequest({ body: { username: 'test' } });
      const res = mockResponse();

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Missing required fields' });
    });

    it('should return 400 when user already exists', async () => {
      db.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });
      const req = mockRequest({
        body: { username: 'test', email: 'test@test.com', password: 'Pass123' }
      });
      const res = mockResponse();

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'User already exists' });
    });

    it('should register user successfully', async () => {
      db.query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ id: 1, username: 'test', email: 'test@test.com' }] });
      bcrypt.hash.mockResolvedValue('hashed-password');
      jwt.sign.mockReturnValue('mock-token');

      const req = mockRequest({
        body: { username: 'test', email: 'test@test.com', password: 'Pass123' }
      });
      const res = mockResponse();

      await register(req, res);

      expect(bcrypt.hash).toHaveBeenCalledWith('Pass123', 10);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User registered successfully',
        user: { id: 1, username: 'test', email: 'test@test.com' },
        token: 'mock-token'
      });
    });

    it('should return 500 on database error', async () => {
      db.query.mockRejectedValue(new Error('DB error'));
      const req = mockRequest({
        body: { username: 'test', email: 'test@test.com', password: 'Pass123' }
      });
      const res = mockResponse();

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });

  describe('login', () => {
    it('should return 400 when email or password is missing', async () => {
      const req = mockRequest({ body: { email: 'test@test.com' } });
      const res = mockResponse();

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Email and password required' });
    });

    it('should return 401 when user is not found', async () => {
      db.query.mockResolvedValue({ rows: [] });
      const req = mockRequest({
        body: { email: 'no@test.com', password: 'Pass123' }
      });
      const res = mockResponse();

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid credentials' });
    });

    it('should return 401 when password is invalid', async () => {
      db.query.mockResolvedValue({
        rows: [{ id: 1, username: 'test', email: 'test@test.com', password_hash: 'hash' }]
      });
      bcrypt.compare.mockResolvedValue(false);
      const req = mockRequest({
        body: { email: 'test@test.com', password: 'wrong' }
      });
      const res = mockResponse();

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid credentials' });
    });

    it('should login successfully with valid credentials', async () => {
      db.query.mockResolvedValue({
        rows: [{ id: 1, username: 'test', email: 'test@test.com', password_hash: 'hash' }]
      });
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('mock-token');

      const req = mockRequest({
        body: { email: 'test@test.com', password: 'Pass123' }
      });
      const res = mockResponse();

      await login(req, res);

      expect(res.json).toHaveBeenCalledWith({
        message: 'Login successful',
        user: { id: 1, username: 'test', email: 'test@test.com' },
        token: 'mock-token'
      });
    });

    it('should return 500 on database error', async () => {
      db.query.mockRejectedValue(new Error('DB error'));
      const req = mockRequest({
        body: { email: 'test@test.com', password: 'Pass123' }
      });
      const res = mockResponse();

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('refreshToken', () => {
    it('should return 400 when refresh token is missing', async () => {
      const req = mockRequest({ body: {} });
      const res = mockResponse();

      await refreshToken(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Refresh token required' });
    });

    it('should return 401 when refresh token is invalid', async () => {
      jwt.verify.mockImplementation(() => { throw new Error('invalid'); });
      const req = mockRequest({ body: { refreshToken: 'bad-token' } });
      const res = mockResponse();

      await refreshToken(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid refresh token' });
    });

    it('should return new token when refresh token is valid', async () => {
      jwt.verify.mockReturnValue({ id: 1, username: 'test', email: 'test@test.com' });
      jwt.sign.mockReturnValue('new-token');
      const req = mockRequest({ body: { refreshToken: 'valid-refresh' } });
      const res = mockResponse();

      await refreshToken(req, res);

      expect(res.json).toHaveBeenCalledWith({ token: 'new-token' });
    });
  });

  describe('logout', () => {
    it('should return success message', async () => {
      const req = mockRequest();
      const res = mockResponse();

      await logout(req, res);

      expect(res.json).toHaveBeenCalledWith({ message: 'Logged out successfully' });
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user data', async () => {
      const userData = { id: 1, username: 'test', email: 'test@test.com', first_name: 'Test', last_name: 'User', avatar_url: null };
      db.query.mockResolvedValue({ rows: [userData] });
      const req = mockRequest({ user: { id: 1 } });
      const res = mockResponse();

      await getCurrentUser(req, res);

      expect(res.json).toHaveBeenCalledWith(userData);
    });

    it('should return 404 when user is not found', async () => {
      db.query.mockResolvedValue({ rows: [] });
      const req = mockRequest({ user: { id: 999 } });
      const res = mockResponse();

      await getCurrentUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });

    it('should return 500 on database error', async () => {
      db.query.mockRejectedValue(new Error('DB error'));
      const req = mockRequest({ user: { id: 1 } });
      const res = mockResponse();

      await getCurrentUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
