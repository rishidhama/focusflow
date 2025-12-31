const express = require('express');
const router = express.Router();
const {
  getTimeBySubject,
  getTimeByDate,
  getProductivityTrends,
  getTaskCompletion,
} = require('../controllers/analyticsController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/time-by-subject', getTimeBySubject);
router.get('/time-by-date', getTimeByDate);
router.get('/productivity-trends', getProductivityTrends);
router.get('/task-completion', getTaskCompletion);

module.exports = router;

