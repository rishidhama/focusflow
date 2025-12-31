import React, { useEffect, useState } from 'react';
import { useTimer } from '../../context/TimerContext';
import { getTasks } from '../../services/tasks';
import './PomodoroTimer.css';

const PomodoroTimer = () => {
  const {
    timeLeft,
    isRunning,
    isPaused,
    sessionType,
    currentTask,
    currentSubject,
    settings,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    skipTimer,
    setTimerType,
  } = useTimer();

  const [tasks, setTasks] = useState([]);
  const [showTaskSelector, setShowTaskSelector] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(false);

  useEffect(() => {
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const loadTasks = async () => {
    try {
      setLoadingTasks(true);
      const tasksData = await getTasks({ status: 'pending' });
      const inProgressTasks = await getTasks({ status: 'in-progress' });
      const allTasks = [...tasksData, ...inProgressTasks];
      setTasks(allTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoadingTasks(false);
    }
  };

  const handleSelectTask = (task) => {
    startTimer(task, task.subjectId);
    setShowTaskSelector(false);
  };

  const handleStartWithTask = () => {
    if (!currentTask) {
      setShowTaskSelector(true);
      loadTasks();
    } else {
      startTimer();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const progress = () => {
    const duration = sessionType === 'focus' 
      ? settings.focusDuration * 60 
      : sessionType === 'long-break' 
      ? settings.longBreakDuration * 60 
      : settings.shortBreakDuration * 60;
    return ((duration - timeLeft) / duration) * 100;
  };

  const getSessionLabel = () => {
    switch (sessionType) {
      case 'focus':
        return 'Focus Time';
      case 'short-break':
        return 'Short Break';
      case 'long-break':
        return 'Long Break';
      default:
        return 'Timer';
    }
  };

  return (
    <div className="timer-container">
      <div className="timer-card">
        <div className="timer-header">
          <h2>{getSessionLabel()}</h2>
          {currentTask ? (
            <div className="timer-task-selected">
              <p className="timer-task">
                {currentTask.title}
                {currentSubject && (
                  <span className="timer-subject" style={{ color: currentSubject.color }}>
                    {' '}• {currentSubject.name}
                  </span>
                )}
              </p>
              {!isRunning && (
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setShowTaskSelector(true);
                    loadTasks();
                  }}
                  style={{ marginTop: '0.5rem' }}
                >
                  Change Task
                </button>
              )}
            </div>
          ) : (
            <div className="timer-task-selector">
              {!isRunning && (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    setShowTaskSelector(true);
                    loadTasks();
                  }}
                >
                  Select Task
                </button>
              )}
            </div>
          )}
        </div>

        <div className="timer-display">
          <div className="timer-circle">
            <svg className="timer-svg" viewBox="0 0 200 200">
              <circle
                className="timer-bg"
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="10"
              />
              <circle
                className="timer-progress"
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke={sessionType === 'focus' ? '#3b82f6' : '#10b981'}
                strokeWidth="10"
                strokeDasharray={`${2 * Math.PI * 90}`}
                strokeDashoffset={`${2 * Math.PI * 90 * (1 - progress() / 100)}`}
                transform="rotate(-90 100 100)"
              />
            </svg>
            <div className="timer-time">{formatTime(timeLeft)}</div>
          </div>
        </div>

        <div className="timer-controls">
          {!isRunning ? (
            <button className="btn btn-primary btn-large" onClick={handleStartWithTask}>
              Start
            </button>
          ) : isPaused ? (
            <button className="btn btn-success btn-large" onClick={resumeTimer}>
              Resume
            </button>
          ) : (
            <button className="btn btn-secondary btn-large" onClick={pauseTimer}>
              Pause
            </button>
          )}
          {isRunning && (
            <>
              <button className="btn btn-secondary" onClick={resetTimer}>
                Reset
              </button>
              <button className="btn btn-secondary" onClick={skipTimer}>
                Skip
              </button>
            </>
          )}
        </div>

        <div className="timer-type-selector">
          <button
            className={`timer-type-btn ${sessionType === 'focus' ? 'active' : ''}`}
            onClick={() => setTimerType('focus')}
            disabled={isRunning}
          >
            Focus
          </button>
          <button
            className={`timer-type-btn ${sessionType === 'short-break' ? 'active' : ''}`}
            onClick={() => setTimerType('short-break')}
            disabled={isRunning}
          >
            Short Break
          </button>
          <button
            className={`timer-type-btn ${sessionType === 'long-break' ? 'active' : ''}`}
            onClick={() => setTimerType('long-break')}
            disabled={isRunning}
          >
            Long Break
          </button>
        </div>
      </div>

      {showTaskSelector && (
        <div className="task-selector-overlay" onClick={() => setShowTaskSelector(false)}>
          <div className="task-selector-modal" onClick={(e) => e.stopPropagation()}>
            <div className="task-selector-header">
              <h3>Select a Task</h3>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowTaskSelector(false)}
              >
                ×
              </button>
            </div>
            <div className="task-selector-list">
              {loadingTasks ? (
                <div className="spinner"></div>
              ) : tasks.length === 0 ? (
                <p className="no-tasks-message">No pending or in-progress tasks found</p>
              ) : (
                tasks.map((task) => (
                  <div
                    key={task._id}
                    className="task-selector-item"
                    onClick={() => handleSelectTask(task)}
                  >
                    <div className="task-selector-item-content">
                      <h4>{task.title}</h4>
                      {task.subjectId && (
                        <span
                          className="task-selector-subject"
                          style={{ backgroundColor: task.subjectId.color || '#3b82f6' }}
                        >
                          {task.subjectId.name}
                        </span>
                      )}
                      <span className="task-selector-priority">{task.priority} priority</span>
                    </div>
                    <div className="task-selector-pomodoros">
                      {task.completedPomodoros || 0} / {task.estimatedPomodoros || 1}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PomodoroTimer;

