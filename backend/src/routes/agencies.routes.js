// Agency Routes
const express = require('express');
const agenciesController = require('../controllers/agencies.controller');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/register', auth, agenciesController.registerAgency);
router.get('/:agencyId', agenciesController.getAgency);
router.post('/:agencyId/broadcasters', auth, agenciesController.addBroadcaster);
router.get('/:agencyId/broadcasters', agenciesController.getAgencyBroadcasters);
router.get('/:agencyId/earnings', auth, agenciesController.getAgencyEarnings);
router.post('/:agencyId/withdraw', auth, agenciesController.withdrawEarnings);

module.exports = router;
