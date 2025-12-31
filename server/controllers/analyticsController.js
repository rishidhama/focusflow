const Session = require('../models/Session');
const Task = require('../models/Task');

// Get time spent by subject
const getTimeBySubject = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = { userId: req.userId, completed: true, type: 'focus' };

    if (startDate || endDate) {
      filter.startedAt = {};
      if (startDate) filter.startedAt.$gte = new Date(startDate);
      if (endDate) filter.startedAt.$lte = new Date(endDate);
    }

    const sessions = await Session.find(filter).populate('subjectId', 'name color');

    const subjectMap = {};
    sessions.forEach((session) => {
      const subjectId = session.subjectId
        ? session.subjectId._id.toString()
        : 'uncategorized';
      const subjectName = session.subjectId
        ? session.subjectId.name
        : 'Uncategorized';
      const subjectColor = session.subjectId
        ? session.subjectId.color
        : '#9CA3AF';

      if (!subjectMap[subjectId]) {
        subjectMap[subjectId] = {
          subjectId,
          subjectName,
          color: subjectColor,
          totalMinutes: 0,
          sessionCount: 0,
        };
      }

      subjectMap[subjectId].totalMinutes += session.duration;
      subjectMap[subjectId].sessionCount += 1;
    });

    const result = Object.values(subjectMap);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get time spent by date
const getTimeByDate = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;
    const filter = { userId: req.userId, completed: true, type: 'focus' };

    if (startDate || endDate) {
      filter.startedAt = {};
      if (startDate) filter.startedAt.$gte = new Date(startDate);
      if (endDate) filter.startedAt.$lte = new Date(endDate);
    }

    const sessions = await Session.find(filter);

    const dateMap = {};
    sessions.forEach((session) => {
      const date = new Date(session.startedAt);
      let key;

      if (groupBy === 'day') {
        key = date.toISOString().split('T')[0]; // YYYY-MM-DD
      } else if (groupBy === 'week') {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
      } else if (groupBy === 'month') {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }

      if (!dateMap[key]) {
        dateMap[key] = { date: key, totalMinutes: 0, sessionCount: 0 };
      }

      dateMap[key].totalMinutes += session.duration;
      dateMap[key].sessionCount += 1;
    });

    const result = Object.values(dateMap).sort((a, b) =>
      a.date.localeCompare(b.date)
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get productivity trends
const getProductivityTrends = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const filter = {
      userId: req.userId,
      completed: true,
      type: 'focus',
      startedAt: { $gte: startDate },
    };

    const sessions = await Session.find(filter);

    const dailyMap = {};
    sessions.forEach((session) => {
      const date = new Date(session.startedAt).toISOString().split('T')[0];

      if (!dailyMap[date]) {
        dailyMap[date] = { date, totalMinutes: 0, sessionCount: 0 };
      }

      dailyMap[date].totalMinutes += session.duration;
      dailyMap[date].sessionCount += 1;
    });

    const result = Object.values(dailyMap).sort((a, b) =>
      a.date.localeCompare(b.date)
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get task completion statistics
const getTaskCompletion = async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.userId });

    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 'completed').length;
    const inProgress = tasks.filter((t) => t.status === 'in-progress').length;
    const pending = tasks.filter((t) => t.status === 'pending').length;

    const completionRate = total > 0 ? (completed / total) * 100 : 0;

    res.json({
      total,
      completed,
      inProgress,
      pending,
      completionRate: completionRate.toFixed(2),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTimeBySubject,
  getTimeByDate,
  getProductivityTrends,
  getTaskCompletion,
};

