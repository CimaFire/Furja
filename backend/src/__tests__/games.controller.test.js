const db = require('../database/db');
const { getGames, getGameDetails, startGame, endGame, getUserGameStats, getLeaderboard } = require('../controllers/games.controller');
const { mockRequest, mockResponse } = require('./helpers');

jest.mock('../database/db', () => ({ query: jest.fn() }));

describe('games.controller', () => {
  describe('getGames', () => {
    it('should return active games', async () => {
      const games = [{ id: 1, name: 'Slots' }, { id: 2, name: 'Roulette' }];
      db.query.mockResolvedValue({ rows: games });
      const req = mockRequest();
      const res = mockResponse();

      await getGames(req, res);

      expect(res.json).toHaveBeenCalledWith(games);
    });

    it('should return 500 on database error', async () => {
      db.query.mockRejectedValue(new Error('DB error'));
      const req = mockRequest();
      const res = mockResponse();

      await getGames(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to get games' });
    });
  });

  describe('getGameDetails', () => {
    it('should return game details', async () => {
      const game = { id: 1, name: 'Slots', description: 'Slot machine' };
      db.query.mockResolvedValue({ rows: [game] });
      const req = mockRequest({ params: { gameId: '1' } });
      const res = mockResponse();

      await getGameDetails(req, res);

      expect(res.json).toHaveBeenCalledWith(game);
    });

    it('should return 404 when game not found', async () => {
      db.query.mockResolvedValue({ rows: [] });
      const req = mockRequest({ params: { gameId: '999' } });
      const res = mockResponse();

      await getGameDetails(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Game not found' });
    });

    it('should return 500 on database error', async () => {
      db.query.mockRejectedValue(new Error('DB error'));
      const req = mockRequest({ params: { gameId: '1' } });
      const res = mockResponse();

      await getGameDetails(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('startGame', () => {
    it('should return 404 when game not found', async () => {
      db.query.mockResolvedValue({ rows: [] });
      const req = mockRequest({
        body: { gameId: 999, streamId: 1, betAmount: 10 },
        user: { id: 1 }
      });
      const res = mockResponse();

      await startGame(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Game not found' });
    });

    it('should return 400 when insufficient balance', async () => {
      db.query
        .mockResolvedValueOnce({ rows: [{ id: 1, name: 'Slots' }] })
        .mockResolvedValueOnce({ rows: [{ balance: 5 }] });
      const req = mockRequest({
        body: { gameId: 1, streamId: 1, betAmount: 10 },
        user: { id: 1 }
      });
      const res = mockResponse();

      await startGame(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Insufficient balance' });
    });

    it('should return 400 when wallet not found', async () => {
      db.query
        .mockResolvedValueOnce({ rows: [{ id: 1, name: 'Slots' }] })
        .mockResolvedValueOnce({ rows: [] });
      const req = mockRequest({
        body: { gameId: 1, streamId: 1, betAmount: 10 },
        user: { id: 1 }
      });
      const res = mockResponse();

      await startGame(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should start game successfully', async () => {
      const session = { id: 1, game_id: 1, user_id: 1, bet_amount: 10, status: 'playing' };
      db.query
        .mockResolvedValueOnce({ rows: [{ id: 1, name: 'Slots' }] })
        .mockResolvedValueOnce({ rows: [{ balance: 100 }] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [session] });
      const req = mockRequest({
        body: { gameId: 1, streamId: 1, betAmount: 10 },
        user: { id: 1 }
      });
      const res = mockResponse();

      await startGame(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Game started',
        session
      });
    });

    it('should return 500 on database error', async () => {
      db.query.mockRejectedValue(new Error('DB error'));
      const req = mockRequest({
        body: { gameId: 1, streamId: 1, betAmount: 10 },
        user: { id: 1 }
      });
      const res = mockResponse();

      await startGame(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('endGame', () => {
    it('should return 404 when session not found', async () => {
      db.query.mockResolvedValue({ rows: [] });
      const req = mockRequest({
        body: { sessionId: 999, result: 'win', winAmount: 20 },
        user: { id: 1 }
      });
      const res = mockResponse();

      await endGame(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Game session not found' });
    });

    it('should end game with win and add winnings', async () => {
      db.query
        .mockResolvedValueOnce({ rows: [{ id: 1, user_id: 1, bet_amount: 10 }] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] });
      const req = mockRequest({
        body: { sessionId: 1, result: 'win', winAmount: 20 },
        user: { id: 1 }
      });
      const res = mockResponse();

      await endGame(req, res);

      expect(res.json).toHaveBeenCalledWith({
        message: 'Game ended',
        result: 'win',
        winAmount: 20
      });
      expect(db.query).toHaveBeenCalledTimes(3);
    });

    it('should end game with loss without adding winnings', async () => {
      db.query
        .mockResolvedValueOnce({ rows: [{ id: 1, user_id: 1, bet_amount: 10 }] })
        .mockResolvedValueOnce({ rows: [] });
      const req = mockRequest({
        body: { sessionId: 1, result: 'lose', winAmount: 0 },
        user: { id: 1 }
      });
      const res = mockResponse();

      await endGame(req, res);

      expect(res.json).toHaveBeenCalledWith({
        message: 'Game ended',
        result: 'lose',
        winAmount: 0
      });
      expect(db.query).toHaveBeenCalledTimes(2);
    });

    it('should return 500 on database error', async () => {
      db.query.mockRejectedValue(new Error('DB error'));
      const req = mockRequest({
        body: { sessionId: 1, result: 'win', winAmount: 20 },
        user: { id: 1 }
      });
      const res = mockResponse();

      await endGame(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getUserGameStats', () => {
    it('should return user game stats', async () => {
      const stats = { total_games: 10, won_games: 6, lost_games: 4, total_winnings: 100 };
      db.query.mockResolvedValue({ rows: [stats] });
      const req = mockRequest({ params: { userId: '1' } });
      const res = mockResponse();

      await getUserGameStats(req, res);

      expect(res.json).toHaveBeenCalledWith(stats);
    });

    it('should return 500 on database error', async () => {
      db.query.mockRejectedValue(new Error('DB error'));
      const req = mockRequest({ params: { userId: '1' } });
      const res = mockResponse();

      await getUserGameStats(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getLeaderboard', () => {
    it('should return leaderboard with default limit', async () => {
      const leaders = [{ id: 1, username: 'user1', total_winnings: 1000 }];
      db.query.mockResolvedValue({ rows: leaders });
      const req = mockRequest({ query: {} });
      const res = mockResponse();

      await getLeaderboard(req, res);

      expect(db.query).toHaveBeenCalledWith(expect.any(String), [100]);
      expect(res.json).toHaveBeenCalledWith(leaders);
    });

    it('should respect custom limit', async () => {
      db.query.mockResolvedValue({ rows: [] });
      const req = mockRequest({ query: { limit: 10 } });
      const res = mockResponse();

      await getLeaderboard(req, res);

      expect(db.query).toHaveBeenCalledWith(expect.any(String), [10]);
    });

    it('should return 500 on database error', async () => {
      db.query.mockRejectedValue(new Error('DB error'));
      const req = mockRequest({ query: {} });
      const res = mockResponse();

      await getLeaderboard(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
