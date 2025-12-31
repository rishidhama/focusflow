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
import { useTimer } from '../context/TimerContext';
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
  const { sessionCompleted } = useTimer();

  useEffect(() => {
    loadAnalytics();
  }, [dateRange, sessionCompleted]);

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

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          padding: 15,
          font: {
            size: 13,
            weight: '500',
          },
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          weight: '600',
        },
        bodyFont: {
          size: 13,
        },
        cornerRadius: 8,
        displayColors: true,
      },
    },
  };

  const pieOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      legend: {
        ...chartOptions.plugins.legend,
        position: 'bottom',
      },
    },
  };

  const lineOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return value + 'h';
          },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  const barOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return value + 'h';
          },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  const defaultColors = [
    '#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe',
    '#43e97b', '#fa709a', '#fee140', '#30cfd0', '#a8edea'
  ];

  const subjectChartData = {
    labels: timeBySubject.map((s) => s.subjectName || 'Uncategorized'),
    datasets: [
      {
        label: 'Time (hours)',
        data: timeBySubject.map((s) => parseFloat((s.totalMinutes / 60).toFixed(2))),
        backgroundColor: timeBySubject.map((s, i) => s.color || defaultColors[i % defaultColors.length]),
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  const dateChartData = {
    labels: timeByDate.map((d) => format(new Date(d.date), 'MMM dd')),
    datasets: [
      {
        label: 'Focus Time (hours)',
        data: timeByDate.map((d) => parseFloat((d.totalMinutes / 60).toFixed(2))),
        backgroundColor: 'rgba(102, 126, 234, 0.8)',
        borderColor: '#667eea',
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const trendsChartData = {
    labels: productivityTrends.map((t) => format(new Date(t.date), 'MMM dd')),
    datasets: [
      {
        label: 'Daily Focus Time (hours)',
        data: productivityTrends.map((t) => parseFloat((t.totalMinutes / 60).toFixed(2))),
        borderColor: '#667eea',
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: '#667eea',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
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
      <div className="analytics-content">
        <div className="analytics-header">
          <h1>Analytics Dashboard</h1>
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
              <Pie data={subjectChartData} options={pieOptions} />
            ) : (
              <p className="no-data">No data available</p>
            )}
          </div>

          <div className="chart-card">
            <h2>Time by Date</h2>
            {timeByDate.length > 0 ? (
              <Bar data={dateChartData} options={barOptions} />
            ) : (
              <p className="no-data">No data available</p>
            )}
          </div>

          <div className="chart-card full-width">
            <h2>Productivity Trends</h2>
            {productivityTrends.length > 0 ? (
              <Line data={trendsChartData} options={lineOptions} />
            ) : (
              <p className="no-data">No data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;

