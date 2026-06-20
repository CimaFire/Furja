const jwt = require('jsonwebtoken');
const { validateToken, requireAdmin } = require('../middleware/auth.middleware');
const { mockRequest, mockResponse } = require('./helpers');

jest.mock('jsonwebtoken');

describe('auth.middleware', () => {
  describe('validateToken', () => {
    it('should return 401 when no authorization header is present', () => {
      const req = mockRequest({ headers: {} });
      const res = mockResponse();
      const next = jest.fn();

      validateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'No token provided' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when authorization header uses non-Bearer scheme', () => {
      jwt.verify.mockImplementation(() => { throw new Error('invalid'); });
      const req = mockRequest({ headers: { authorization: 'Basic abc' } });
      const res = mockResponse();
      const next = jest.fn();

      validateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when token is invalid', () => {
      jwt.verify.mockImplementation(() => { throw new Error('invalid'); });
      const req = mockRequest({ headers: { authorization: 'Bearer invalid-token' } });
      const res = mockResponse();
      const next = jest.fn();

      validateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should set req.user and call next when token is valid', () => {
      const decoded = { id: 1, username: 'testuser', email: 'test@example.com' };
      jwt.verify.mockReturnValue(decoded);
      const req = mockRequest({ headers: { authorization: 'Bearer valid-token' } });
      const res = mockResponse();
      const next = jest.fn();

      validateToken(req, res, next);

      expect(req.user).toEqual(decoded);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe('requireAdmin', () => {
    it('should return 403 when user is not admin', () => {
      const req = mockRequest({ user: { role: 'user' } });
      const res = mockResponse();
      const next = jest.fn();

      requireAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Admin access required' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 403 when user has no role', () => {
      const req = mockRequest({ user: {} });
      const res = mockResponse();
      const next = jest.fn();

      requireAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 403 when req.user is null', () => {
      const req = mockRequest({ user: null });
      const res = mockResponse();
      const next = jest.fn();

      requireAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next when user is admin', () => {
      const req = mockRequest({ user: { role: 'admin' } });
      const res = mockResponse();
      const next = jest.fn();

      requireAdmin(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });
});
