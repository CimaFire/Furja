const db = require('../database/db');
const asyncHandler = require('../utils/asyncHandler');
const { findOneOrFail, findMany, requireSufficientBalance, adjustWalletBalance } = require('../utils/db.helpers');

// Get all games
const getGames = asyncHandler(async (req, res) => {
  const games = await findMany(
    'SELECT * FROM games WHERE is_active = true ORDER BY name ASC'
  );

  res.json(games);
});

// Get game details
const getGameDetails = asyncHandler(async (req, res) => {
  const game = await findOneOrFail(
    'SELECT * FROM games WHERE id = $1',
    [req.params.gameId],
    'Game'
  );

  res.json(game);
});

// Start game
const startGame = asyncHandler(async (req, res) => {
  const { gameId, streamId, betAmount } = req.body;
  const userId = req.user.id;

  await findOneOrFail(
    'SELECT * FROM games WHERE id = $1',
    [gameId],
    'Game'
  );

  await requireSufficientBalance(userId, 'USD', betAmount);

  await adjustWalletBalance(userId, 'USD', -betAmount);

  const sessionResult = await db.query(
    `INSERT INTO game_sessions (game_id, user_id, stream_id, bet_amount, status, started_at)
     VALUES ($1, $2, $3, $4, 'playing', NOW())
     RETURNING *`,
    [gameId, userId, streamId, betAmount]
  );

  res.status(201).json({
    message: 'Game started',
    session: sessionResult.rows[0]
  });
});

// End game
const endGame = asyncHandler(async (req, res) => {
  const { sessionId, result: gameResult, winAmount } = req.body;
  const userId = req.user.id;

  await findOneOrFail(
    'SELECT * FROM game_sessions WHERE id = $1 AND user_id = $2',
    [sessionId, userId],
    'Game session'
  );

  await db.query(
    `UPDATE game_sessions SET status = $1, result = $2, win_amount = $3, ended_at = NOW()
     WHERE id = $4`,
    [gameResult === 'win' ? 'won' : 'lost', gameResult, winAmount || 0, sessionId]
  );

  if (gameResult === 'win' && winAmount > 0) {
    await adjustWalletBalance(userId, 'USD', winAmount);
  }

  res.json({
    message: 'Game ended',
    result: gameResult,
    winAmount: winAmount || 0
  });
});

// Get user game stats
const getUserGameStats = asyncHandler(async (req, res) => {
  const stats = await db.query(
    `SELECT 
      COUNT(*) as total_games,
      COUNT(CASE WHEN result = 'win' THEN 1 END) as won_games,
      COUNT(CASE WHEN result = 'lost' THEN 1 END) as lost_games,
      SUM(CASE WHEN result = 'win' THEN win_amount ELSE -bet_amount END) as total_winnings,
      AVG(CASE WHEN result = 'win' THEN win_amount ELSE -bet_amount END) as average_return
     FROM game_sessions
     WHERE user_id = $1`,
    [req.params.userId]
  );

  res.json(stats.rows[0]);
});

// Get leaderboard
const getLeaderboard = asyncHandler(async (req, res) => {
  const { limit = 100 } = req.query;

  const result = await db.query(
    `SELECT 
      u.id,
      u.username,
      u.avatar_url,
      COUNT(gs.id) as total_games,
      SUM(CASE WHEN gs.result = 'win' THEN 1 ELSE 0 END) as wins,
      SUM(CASE WHEN gs.result = 'lost' THEN 1 ELSE 0 END) as losses,
      SUM(CASE WHEN gs.result = 'win' THEN gs.win_amount ELSE -gs.bet_amount END) as total_winnings
     FROM users u
     LEFT JOIN game_sessions gs ON u.id = gs.user_id
     WHERE gs.status IN ('won', 'lost')
     GROUP BY u.id, u.username, u.avatar_url
     ORDER BY total_winnings DESC
     LIMIT $1`,
    [limit]
  );

  res.json(result.rows);
});

module.exports = { getGames, getGameDetails, startGame, endGame, getUserGameStats, getLeaderboard };
