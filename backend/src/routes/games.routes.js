// Games Routes
const express = require('express');
const gamesController = require('../controllers/games.controller');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', gamesController.getGames);
router.get('/:gameId', gamesController.getGameDetails);
router.post('/start', auth, gamesController.startGame);
router.post('/end', auth, gamesController.endGame);
router.get('/user/:userId/stats', gamesController.getUserGameStats);
router.get('/leaderboard', gamesController.getLeaderboard);

module.exports = router;
