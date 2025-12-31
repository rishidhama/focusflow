import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { getSettings, saveSettings } from '../utils/storage';
import { createSession } from '../services/sessions';
import { updateTask } from '../services/tasks';

const TimerContext = createContext();

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};

const DEFAULT_SETTINGS = {
  focusDuration: 25, // minutes
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4, // every 4th break is long
};

export const TimerProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    const saved = getSettings();
    return { ...DEFAULT_SETTINGS, ...saved.timer };
  });

  const [timeLeft, setTimeLeft] = useState(settings.focusDuration * 60); // in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [sessionType, setSessionType] = useState('focus'); // focus, short-break, long-break
  const [sessionCount, setSessionCount] = useState(0);
  const [currentTask, setCurrentTask] = useState(null);
  const [currentSubject, setCurrentSubject] = useState(null);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [sessionCompleted, setSessionCompleted] = useState(0); // Counter to trigger refreshes

  const intervalRef = useRef(null);

  useEffect(() => {
    // Save settings when they change
    saveSettings({ timer: settings });
  }, [settings]);

  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused]);

  const handleTimerComplete = async () => {
    setIsRunning(false);
    setIsPaused(false);
    
    // Save session if it was a focus session
    if (sessionType === 'focus' && sessionStartTime) {
      try {
        const duration = settings.focusDuration;
        
        const session = await createSession({
          duration,
          type: sessionType,
          completed: true,
          startedAt: sessionStartTime,
          endedAt: new Date().toISOString(),
          taskId: currentTask?._id || null,
          subjectId: currentSubject?._id || currentTask?.subjectId?._id || null,
        });

        // Increment completed pomodoros for the task if one is associated
        if (currentTask?._id) {
          try {
            const currentCompleted = currentTask.completedPomodoros || 0;
            const newCompletedPomodoros = currentCompleted + 1;
            
            console.log('Updating task pomodoros:', {
              taskId: currentTask._id,
              current: currentCompleted,
              new: newCompletedPomodoros
            });
            
            const updatedTask = await updateTask(currentTask._id, {
              completedPomodoros: newCompletedPomodoros,
            });
            
            console.log('Task updated successfully:', updatedTask);
            
            // Update currentTask state to reflect the change
            setCurrentTask({ ...currentTask, completedPomodoros: newCompletedPomodoros });
            // Trigger refresh in components that listen to this
            setSessionCompleted(prev => prev + 1);
          } catch (error) {
            console.error('Error updating task pomodoros:', error);
            console.error('Error details:', error.response?.data || error.message);
          }
        } else {
          console.log('No task associated with timer session');
        }
      } catch (error) {
        console.error('Error saving session:', error);
      }
    }
    
    // Show notification
    if (Notification.permission === 'granted') {
      new Notification(
        sessionType === 'focus' ? 'Focus session complete!' : 'Break time is over!',
        {
          body: sessionType === 'focus' ? 'Time for a break!' : 'Ready to focus again?',
        }
      );
    }

    // Update document title
    document.title = 'FocusFlow';

    // Auto-start break after focus session
    if (sessionType === 'focus') {
      const newCount = sessionCount + 1;
      setSessionCount(newCount);
      
      // Determine break type
      const breakType = newCount % settings.longBreakInterval === 0 
        ? 'long-break' 
        : 'short-break';
      
      setSessionType(breakType);
      const breakDuration = breakType === 'long-break' 
        ? settings.longBreakDuration 
        : settings.shortBreakDuration;
      setTimeLeft(breakDuration * 60);
    }
    
    setSessionStartTime(null);
  };

  const startTimer = (task = null, subject = null) => {
    setCurrentTask(task);
    setCurrentSubject(subject);
    setIsRunning(true);
    setIsPaused(false);
    setSessionStartTime(new Date().toISOString());
    
    // Update document title
    updateDocumentTitle();
  };

  const pauseTimer = () => {
    setIsPaused(true);
  };

  const resumeTimer = () => {
    setIsPaused(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    setSessionStartTime(null);
    const duration = sessionType === 'focus' 
      ? settings.focusDuration 
      : sessionType === 'long-break'
      ? settings.longBreakDuration
      : settings.shortBreakDuration;
    setTimeLeft(duration * 60);
    document.title = 'FocusFlow';
  };

  const skipTimer = () => {
    handleTimerComplete();
  };

  const setTimerType = (type) => {
    setSessionType(type);
    const duration = type === 'focus' 
      ? settings.focusDuration 
      : type === 'long-break'
      ? settings.longBreakDuration
      : settings.shortBreakDuration;
    setTimeLeft(duration * 60);
    resetTimer();
  };

  const updateDocumentTitle = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    document.title = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')} - FocusFlow`;
  };

  useEffect(() => {
    if (isRunning && !isPaused) {
      updateDocumentTitle();
    }
  }, [timeLeft, isRunning, isPaused]);

  const updateSettings = (newSettings) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    // Reset timer if duration changed
    if (newSettings.focusDuration || newSettings.shortBreakDuration || newSettings.longBreakDuration) {
      resetTimer();
    }
  };

  const value = {
    timeLeft,
    isRunning,
    isPaused,
    sessionType,
    sessionCount,
    currentTask,
    currentSubject,
    settings,
    sessionCompleted,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    skipTimer,
    setTimerType,
    updateSettings,
  };

  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>;
};

