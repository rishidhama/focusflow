const Task = require('../models/Task');

// Get all tasks for user
const getTasks = async (req, res) => {
  try {
    const { status, subjectId } = req.query;
    const filter = { userId: req.userId };

    if (status) filter.status = status;
    if (subjectId) filter.subjectId = subjectId;

    const tasks = await Task.find(filter)
      .populate('subjectId', 'name color')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single task
const getTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.userId,
    }).populate('subjectId', 'name color');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create task
const createTask = async (req, res) => {
  try {
    const taskData = {
      ...req.body,
      userId: req.userId,
    };

    const task = await Task.create(taskData);
    await task.populate('subjectId', 'name color');

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update task
const updateTask = async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true, runValidators: true }
    ).populate('subjectId', 'name color');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete task
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark task as completed
const completeTask = async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      {
        status: 'completed',
        completedAt: new Date(),
      },
      { new: true }
    ).populate('subjectId', 'name color');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  completeTask,
};

