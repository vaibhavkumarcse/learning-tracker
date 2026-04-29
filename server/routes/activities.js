const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const auth = require('../middleware/auth');

router.use(auth); // Protect all activity routes

router.get('/stats', activityController.getStats);
router.post('/log', activityController.logActivity);

module.exports = router;
