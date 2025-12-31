import React, { useEffect } from 'react';
import { useTimer } from '../../context/TimerContext';
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

  useEffect(() => {
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

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
            <p className="timer-task">
              {currentTask.title}
              {currentSubject && (
                <span className="timer-subject" style={{ color: currentSubject.color }}>
                  {' '}• {currentSubject.name}
                </span>
              )}
            </p>
          ) : (
            <p className="timer-task" style={{ color: '#9ca3af', fontStyle: 'italic' }}>
              No task selected - pomodoros won't be tracked
            </p>
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
            <button className="btn btn-primary btn-large" onClick={startTimer}>
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
    </div>
  );
};

export default PomodoroTimer;

