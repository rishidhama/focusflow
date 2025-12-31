import React, { useState } from 'react';
import PomodoroTimer from '../components/Timer/PomodoroTimer';
import TaskList from '../components/TaskManager/TaskList';
import SubjectManager from '../components/Subjects/SubjectManager';
import StatsOverview from '../components/Dashboard/StatsOverview';
import { useTimer } from '../context/TimerContext';
import './Dashboard.css';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('tasks');

  return (
    <div className="dashboard">
      <div className="timer-section">
        <PomodoroTimer />
      </div>

      <div className="dashboard-scrollable">
        <div className="dashboard-container">
          <StatsOverview />

          <div className="content-section">
            <div className="content-tabs">
              <button
                className={`tab-btn ${activeTab === 'tasks' ? 'active' : ''}`}
                onClick={() => setActiveTab('tasks')}
              >
                Tasks
              </button>
              <button
                className={`tab-btn ${activeTab === 'subjects' ? 'active' : ''}`}
                onClick={() => setActiveTab('subjects')}
              >
                Subjects
              </button>
            </div>
            <div className="content-panel">
              {activeTab === 'tasks' ? <TaskList /> : <SubjectManager />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

