const express = require('express');
const gamesController = require('../controllers/games.controller');
const { validateToken } = require('../middleware/auth.middleware');
const router = express.Router();

router.get('/', gamesController.getGames);
router.get('/:gameId', gamesController.getGameDetails);
router.post('/start', validateToken, gamesController.startGame);
router.post('/end', validateToken, gamesController.endGame);
router.get('/user/:userId/stats', validateToken, gamesController.getUserGameStats);
router.get('/leaderboard', gamesController.getLeaderboard);

module.exports = router;
