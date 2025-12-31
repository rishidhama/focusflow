const express = require('express');
const router = express.Router();
const {
  getSessions,
  createSession,
  updateSession,
  getStats,
} = require('../controllers/sessionController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', getSessions);
router.get('/stats', getStats);
router.post('/', createSession);
router.put('/:id', updateSession);

module.exports = router;

