import React, { useState, useEffect } from 'react';
import { getTasks } from '../../services/tasks';
import { getSessionStats } from '../../services/sessions';
import { format } from 'date-fns';
import './StatsOverview.css';

const StatsOverview = () => {
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    todayMinutes: 0,
    weekMinutes: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [tasks, todayStats, weekStats] = await Promise.all([
        getTasks(),
        getSessionStats({
          startDate: format(new Date(), 'yyyy-MM-dd'),
          endDate: format(new Date(), 'yyyy-MM-dd'),
        }),
        getSessionStats({
          startDate: format(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
          endDate: format(new Date(), 'yyyy-MM-dd'),
        }),
      ]);

      const completed = tasks.filter((t) => t.status === 'completed').length;
      const pending = tasks.filter((t) => t.status === 'pending').length;

      setStats({
        totalTasks: tasks.length,
        completedTasks: completed,
        pendingTasks: pending,
        todayMinutes: todayStats.totalMinutes || 0,
        weekMinutes: weekStats.totalMinutes || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="stats-overview loading">Loading stats...</div>;
  }

  const completionRate =
    stats.totalTasks > 0
      ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
      : 0;

  return (
    <div className="stats-overview">
      <div className="stat-card">
        <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
          Tasks
        </div>
        <div className="stat-content">
          <div className="stat-value">{stats.totalTasks}</div>
          <div className="stat-label">Total Tasks</div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
          Done
        </div>
        <div className="stat-content">
          <div className="stat-value">{stats.completedTasks}</div>
          <div className="stat-label">Completed</div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
          Time
        </div>
        <div className="stat-content">
          <div className="stat-value">{Math.round(stats.todayMinutes / 60 * 10) / 10}h</div>
          <div className="stat-label">Today's Focus</div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.1)' }}>
          Rate
        </div>
        <div className="stat-content">
          <div className="stat-value">{completionRate}%</div>
          <div className="stat-label">Completion Rate</div>
        </div>
      </div>
    </div>
  );
};

export default StatsOverview;

