import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  getTimeBySubject,
  getTimeByDate,
  getProductivityTrends,
  getTaskCompletion,
} from '../services/analytics';
import { format, subDays } from 'date-fns';
import './Analytics.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Analytics = () => {
  const [timeBySubject, setTimeBySubject] = useState([]);
  const [timeByDate, setTimeByDate] = useState([]);
  const [productivityTrends, setProductivityTrends] = useState([]);
  const [taskStats, setTaskStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState(30);

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const startDate = format(subDays(new Date(), dateRange), 'yyyy-MM-dd');
      const endDate = format(new Date(), 'yyyy-MM-dd');

      const [subjectData, dateData, trendsData, taskData] = await Promise.all([
        getTimeBySubject({ startDate, endDate }),
        getTimeByDate({ startDate, endDate, groupBy: 'day' }),
        getProductivityTrends(dateRange),
        getTaskCompletion(),
      ]);

      setTimeBySubject(subjectData);
      setTimeByDate(dateData);
      setProductivityTrends(trendsData);
      setTaskStats(taskData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const subjectChartData = {
    labels: timeBySubject.map((s) => s.subjectName || 'Uncategorized'),
    datasets: [
      {
        label: 'Time (hours)',
        data: timeBySubject.map((s) => (s.totalMinutes / 60).toFixed(2)),
        backgroundColor: timeBySubject.map((s) => s.color || '#3b82f6'),
      },
    ],
  };

  const dateChartData = {
    labels: timeByDate.map((d) => format(new Date(d.date), 'MMM dd')),
    datasets: [
      {
        label: 'Focus Time (hours)',
        data: timeByDate.map((d) => (d.totalMinutes / 60).toFixed(2)),
        backgroundColor: '#3b82f6',
      },
    ],
  };

  const trendsChartData = {
    labels: productivityTrends.map((t) => format(new Date(t.date), 'MMM dd')),
    datasets: [
      {
        label: 'Daily Focus Time (hours)',
        data: productivityTrends.map((t) => (t.totalMinutes / 60).toFixed(2)),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
    ],
  };

  if (loading) {
    return (
      <div className="container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h1>Analytics</h1>
        <select
          className="date-range-select"
          value={dateRange}
          onChange={(e) => setDateRange(parseInt(e.target.value))}
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      {taskStats && (
        <div className="stats-cards">
          <div className="stat-card">
            <h3>Total Tasks</h3>
            <p className="stat-value">{taskStats.total}</p>
          </div>
          <div className="stat-card">
            <h3>Completed</h3>
            <p className="stat-value">{taskStats.completed}</p>
          </div>
          <div className="stat-card">
            <h3>Completion Rate</h3>
            <p className="stat-value">{taskStats.completionRate}%</p>
          </div>
          <div className="stat-card">
            <h3>In Progress</h3>
            <p className="stat-value">{taskStats.inProgress}</p>
          </div>
        </div>
      )}

      <div className="charts-grid">
        <div className="chart-card">
          <h2>Time by Subject</h2>
          {timeBySubject.length > 0 ? (
            <Pie data={subjectChartData} />
          ) : (
            <p className="no-data">No data available</p>
          )}
        </div>

        <div className="chart-card">
          <h2>Time by Date</h2>
          {timeByDate.length > 0 ? (
            <Bar data={dateChartData} />
          ) : (
            <p className="no-data">No data available</p>
          )}
        </div>

        <div className="chart-card full-width">
          <h2>Productivity Trends</h2>
          {productivityTrends.length > 0 ? (
            <Line data={trendsChartData} />
          ) : (
            <p className="no-data">No data available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;

