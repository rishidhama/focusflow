const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const Task = require('../models/Task');
const Subject = require('../models/Subject');
const Session = require('../models/Session');

router.use(authenticate);

// Push local changes to server
router.post('/push', async (req, res) => {
  try {
    const { tasks, subjects, sessions } = req.body;
    const userId = req.userId;

    const results = {
      tasks: { created: 0, updated: 0, errors: [] },
      subjects: { created: 0, updated: 0, errors: [] },
      sessions: { created: 0, updated: 0, errors: [] },
    };

    // Sync tasks
    if (tasks) {
      for (const task of tasks) {
        try {
          if (task._id && task._id.startsWith('local-')) {
            // New task
            const newTask = await Task.create({ ...task, userId, _id: undefined });
            results.tasks.created++;
          } else {
            // Update existing
            await Task.findOneAndUpdate(
              { _id: task._id, userId },
              task,
              { upsert: true }
            );
            results.tasks.updated++;
          }
        } catch (error) {
          results.tasks.errors.push({ task: task._id, error: error.message });
        }
      }
    }

    // Sync subjects
    if (subjects) {
      for (const subject of subjects) {
        try {
          if (subject._id && subject._id.startsWith('local-')) {
            const newSubject = await Subject.create({
              ...subject,
              userId,
              _id: undefined,
            });
            results.subjects.created++;
          } else {
            await Subject.findOneAndUpdate(
              { _id: subject._id, userId },
              subject,
              { upsert: true }
            );
            results.subjects.updated++;
          }
        } catch (error) {
          results.subjects.errors.push({
            subject: subject._id,
            error: error.message,
          });
        }
      }
    }

    // Sync sessions
    if (sessions) {
      for (const session of sessions) {
        try {
          if (session._id && session._id.startsWith('local-')) {
            await Session.create({ ...session, userId, _id: undefined });
            results.sessions.created++;
          } else {
            await Session.findOneAndUpdate(
              { _id: session._id, userId },
              session,
              { upsert: true }
            );
            results.sessions.updated++;
          }
        } catch (error) {
          results.sessions.errors.push({
            session: session._id,
            error: error.message,
          });
        }
      }
    }

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Pull server data to client
router.post('/pull', async (req, res) => {
  try {
    const userId = req.userId;
    const { lastSyncAt } = req.body;

    const filter = lastSyncAt
      ? { userId, updatedAt: { $gt: new Date(lastSyncAt) } }
      : { userId };

    const [tasks, subjects, sessions] = await Promise.all([
      Task.find(filter).populate('subjectId', 'name color'),
      Subject.find(filter),
      Session.find(filter)
        .populate('taskId', 'title')
        .populate('subjectId', 'name color'),
    ]);

    res.json({
      tasks,
      subjects,
      sessions,
      syncTime: new Date(),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get sync status
router.get('/status', async (req, res) => {
  try {
    const userId = req.userId;
    const counts = {
      tasks: await Task.countDocuments({ userId }),
      subjects: await Subject.countDocuments({ userId }),
      sessions: await Session.countDocuments({ userId }),
    };

    res.json(counts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

