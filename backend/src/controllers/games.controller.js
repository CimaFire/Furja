const db = require('../database/db');

// Get all games
const getGames = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM games WHERE is_active = true ORDER BY name ASC'
    );

    res.json(result.rows);
  } catch (error) {
    console.error('getGames error:', error);
    res.status(500).json({ error: 'Failed to get games' });
  }
};

// Get game details
const getGameDetails = async (req, res) => {
  try {
    const { gameId } = req.params;

    const result = await db.query(
      'SELECT * FROM games WHERE id = $1',
      [gameId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Game not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('getGameDetails error:', error);
    res.status(500).json({ error: 'Failed to get game details' });
  }
};

// Start game
const startGame = async (req, res) => {
  const client = await db.connect();

  try {
    const { gameId, streamId, betAmount } = req.body;
    const userId = req.user.id;

    if (!gameId || betAmount == null) {
      return res.status(400).json({ error: 'gameId and betAmount are required' });
    }

    if (typeof betAmount !== 'number' || betAmount <= 0) {
      return res.status(400).json({ error: 'betAmount must be a positive number' });
    }

    await client.query('BEGIN');

    // Get game
    const gameResult = await client.query(
      'SELECT * FROM games WHERE id = $1',
      [gameId]
    );

    if (gameResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Game not found' });
    }

    // Check balance with row lock
    const walletResult = await client.query(
      'SELECT * FROM user_wallets WHERE user_id = $1 AND currency = $2 FOR UPDATE',
      [userId, 'USD']
    );

    if (walletResult.rows.length === 0 || walletResult.rows[0].balance < betAmount) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Deduct bet
    await client.query(
      'UPDATE user_wallets SET balance = balance - $1 WHERE user_id = $2 AND currency = $3',
      [betAmount, userId, 'USD']
    );

    // Create game session
    const sessionResult = await client.query(
      `INSERT INTO game_sessions (game_id, user_id, stream_id, bet_amount, status, started_at)
       VALUES ($1, $2, $3, $4, 'playing', NOW())
       RETURNING *`,
      [gameId, userId, streamId, betAmount]
    );

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Game started',
      session: sessionResult.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('startGame error:', error);
    res.status(500).json({ error: 'Failed to start game' });
  } finally {
    client.release();
  }
};

// End game
const endGame = async (req, res) => {
  const client = await db.connect();

  try {
    const { sessionId, result: gameResult, winAmount } = req.body;
    const userId = req.user.id;

    if (!sessionId || !gameResult) {
      return res.status(400).json({ error: 'sessionId and result are required' });
    }

    await client.query('BEGIN');

    // Get session
    const sessionResult = await client.query(
      'SELECT * FROM game_sessions WHERE id = $1 AND user_id = $2 FOR UPDATE',
      [sessionId, userId]
    );

    if (sessionResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Game session not found' });
    }

    const session = sessionResult.rows[0];

    if (session.status !== 'playing') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Game session is not active' });
    }

    // Update session
    await client.query(
      `UPDATE game_sessions SET status = $1, result = $2, win_amount = $3, ended_at = NOW()
       WHERE id = $4`,
      [gameResult === 'win' ? 'won' : 'lost', gameResult, winAmount || 0, sessionId]
    );

    // Add winnings to wallet if won
    if (gameResult === 'win' && winAmount > 0) {
      await client.query(
        'UPDATE user_wallets SET balance = balance + $1 WHERE user_id = $2 AND currency = $3',
        [winAmount, userId, 'USD']
      );
    }

    await client.query('COMMIT');

    res.json({
      message: 'Game ended',
      result: gameResult,
      winAmount: winAmount || 0
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('endGame error:', error);
    res.status(500).json({ error: 'Failed to end game' });
  } finally {
    client.release();
  }
};

// Get user game stats
const getUserGameStats = async (req, res) => {
  try {
    const { userId } = req.params;

    const stats = await db.query(
      `SELECT 
        COUNT(*) as total_games,
        COUNT(CASE WHEN result = 'win' THEN 1 END) as won_games,
        COUNT(CASE WHEN result = 'lost' THEN 1 END) as lost_games,
        SUM(CASE WHEN result = 'win' THEN win_amount ELSE -bet_amount END) as total_winnings,
        AVG(CASE WHEN result = 'win' THEN win_amount ELSE -bet_amount END) as average_return
       FROM game_sessions
       WHERE user_id = $1`,
      [userId]
    );

    res.json(stats.rows[0]);
  } catch (error) {
    console.error('getUserGameStats error:', error);
    res.status(500).json({ error: 'Failed to get game stats' });
  }
};

// Get leaderboard
const getLeaderboard = async (req, res) => {
  try {
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
  } catch (error) {
    console.error('getLeaderboard error:', error);
    res.status(500).json({ error: 'Failed to get leaderboard' });
  }
};

module.exports = {
  getGames,
  getGameDetails,
  startGame,
  endGame,
  getUserGameStats,
  getLeaderboard
};
