// Games Routes
const express = require('express');
const gamesController = require('../controllers/games.controller');
const { validateToken } = require('../middleware/auth.middleware');
const router = express.Router();

router.get('/', gamesController.getGames);
router.get('/leaderboard', gamesController.getLeaderboard);
router.get('/user/:userId/stats', gamesController.getUserGameStats);
router.get('/:gameId', gamesController.getGameDetails);
router.post('/start', validateToken, gamesController.startGame);
router.post('/end', validateToken, gamesController.endGame);

module.exports = router;
