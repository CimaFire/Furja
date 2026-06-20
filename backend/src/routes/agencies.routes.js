// Agency Routes
const express = require('express');
const agenciesController = require('../controllers/agencies.controller');
const { validateToken } = require('../middleware/auth.middleware');
const router = express.Router();

router.post('/register', validateToken, agenciesController.registerAgency);
router.get('/:agencyId', agenciesController.getAgency);
router.post('/:agencyId/broadcasters', validateToken, agenciesController.addBroadcaster);
router.get('/:agencyId/broadcasters', agenciesController.getAgencyBroadcasters);
router.get('/:agencyId/earnings', validateToken, agenciesController.getAgencyEarnings);
router.post('/:agencyId/withdraw', validateToken, agenciesController.withdrawEarnings);

module.exports = router;
