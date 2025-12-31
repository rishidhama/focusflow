const Session = require('../models/Session');

// Get all sessions for user
const getSessions = async (req, res) => {
  try {
    const { startDate, endDate, subjectId, type } = req.query;
    const filter = { userId: req.userId };

    if (startDate || endDate) {
      filter.startedAt = {};
      if (startDate) filter.startedAt.$gte = new Date(startDate);
      if (endDate) filter.startedAt.$lte = new Date(endDate);
    }

    if (subjectId) filter.subjectId = subjectId;
    if (type) filter.type = type;

    const sessions = await Session.find(filter)
      .populate('taskId', 'title')
      .populate('subjectId', 'name color')
      .sort({ startedAt: -1 })
      .limit(100);

    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create session
const createSession = async (req, res) => {
  try {
    const session = await Session.create({
      ...req.body,
      userId: req.userId,
    });

    await session.populate('taskId', 'title');
    await session.populate('subjectId', 'name color');

    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update session (mark as completed)
const updateSession = async (req, res) => {
  try {
    const session = await Session.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      {
        ...req.body,
        endedAt: req.body.completed ? new Date() : session.endedAt,
      },
      { new: true }
    )
      .populate('taskId', 'title')
      .populate('subjectId', 'name color');

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    res.json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get session statistics
const getStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = { userId: req.userId, completed: true };

    if (startDate || endDate) {
      filter.startedAt = {};
      if (startDate) filter.startedAt.$gte = new Date(startDate);
      if (endDate) filter.startedAt.$lte = new Date(endDate);
    }

    const sessions = await Session.find(filter);

    const totalMinutes = sessions.reduce(
      (sum, session) => sum + session.duration,
      0
    );
    const totalSessions = sessions.length;
    const focusSessions = sessions.filter((s) => s.type === 'focus').length;

    res.json({
      totalMinutes,
      totalHours: (totalMinutes / 60).toFixed(2),
      totalSessions,
      focusSessions,
      averageSessionLength: totalSessions > 0 ? totalMinutes / totalSessions : 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSessions,
  createSession,
  updateSession,
  getStats,
};

