const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  completeTask,
} = require('../controllers/taskController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', getTasks);
router.get('/:id', getTask);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);
router.put('/:id/complete', completeTask);

module.exports = router;

