import React, { useState } from 'react';
import { useTimer } from '../context/TimerContext';
import { getTasks } from '../services/tasks';
import { getSessions } from '../services/sessions';
import { exportToCSV } from '../utils/export';
import './Settings.css';

const Settings = () => {
  const { settings, updateSettings } = useTimer();
  const [localSettings, setLocalSettings] = useState(settings);
  const [saved, setSaved] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleSettingChange = (key, value) => {
    setLocalSettings({ ...localSettings, [key]: parseInt(value) || value });
    setSaved(false);
  };

  const handleSave = () => {
    updateSettings(localSettings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleExportTasks = async () => {
    try {
      setExporting(true);
      const tasks = await getTasks();
      exportToCSV(tasks, 'focusflow-tasks');
      setExporting(false);
    } catch (error) {
      console.error('Error exporting tasks:', error);
      setExporting(false);
    }
  };

  const handleExportSessions = async () => {
    try {
      setExporting(true);
      const sessions = await getSessions();
      exportToCSV(sessions, 'focusflow-sessions');
      setExporting(false);
    } catch (error) {
      console.error('Error exporting sessions:', error);
      setExporting(false);
    }
  };

  return (
    <div className="settings-container">
      <div className="settings-content">
        <h1>Settings</h1>

        <div className="settings-section">
          <h2>Timer Settings</h2>
          <p className="settings-description">
            Customize your Pomodoro timer durations and intervals
          </p>

          <div className="settings-group">
            <label className="settings-label">
              Focus Duration (minutes)
              <input
                type="number"
                min="1"
                max="60"
                value={localSettings.focusDuration}
                onChange={(e) => handleSettingChange('focusDuration', e.target.value)}
                className="settings-input"
              />
            </label>
          </div>

          <div className="settings-group">
            <label className="settings-label">
              Short Break Duration (minutes)
              <input
                type="number"
                min="1"
                max="30"
                value={localSettings.shortBreakDuration}
                onChange={(e) => handleSettingChange('shortBreakDuration', e.target.value)}
                className="settings-input"
              />
            </label>
          </div>

          <div className="settings-group">
            <label className="settings-label">
              Long Break Duration (minutes)
              <input
                type="number"
                min="1"
                max="60"
                value={localSettings.longBreakDuration}
                onChange={(e) => handleSettingChange('longBreakDuration', e.target.value)}
                className="settings-input"
              />
            </label>
          </div>

          <div className="settings-group">
            <label className="settings-label">
              Long Break Interval
              <input
                type="number"
                min="2"
                max="10"
                value={localSettings.longBreakInterval}
                onChange={(e) => handleSettingChange('longBreakInterval', e.target.value)}
                className="settings-input"
              />
              <span className="settings-hint">
                Every Nth break will be a long break
              </span>
            </label>
          </div>

          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saved}
          >
            {saved ? 'Saved!' : 'Save Timer Settings'}
          </button>
        </div>

        <div className="settings-section">
          <h2>Data Export</h2>
          <p className="settings-description">
            Export your tasks and sessions data to CSV format
          </p>

          <div className="export-buttons">
            <button
              className="btn btn-secondary"
              onClick={handleExportTasks}
              disabled={exporting}
            >
              {exporting ? 'Exporting...' : 'Export Tasks'}
            </button>
            <button
              className="btn btn-secondary"
              onClick={handleExportSessions}
              disabled={exporting}
            >
              {exporting ? 'Exporting...' : 'Export Sessions'}
            </button>
          </div>
        </div>

        <div className="settings-section">
          <h2>Notifications</h2>
          <p className="settings-description">
            Browser notifications for timer completion
          </p>
          <div className="settings-group">
            <label className="settings-label">
              <input
                type="checkbox"
                checked={Notification.permission === 'granted'}
                disabled
                className="settings-checkbox"
              />
              <span>
                {Notification.permission === 'granted'
                  ? 'Notifications enabled'
                  : Notification.permission === 'denied'
                  ? 'Notifications blocked by browser'
                  : 'Click Allow when prompted to enable notifications'}
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;

