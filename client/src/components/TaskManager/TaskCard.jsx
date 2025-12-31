import React from 'react';
import { format, isPast, isToday, isTomorrow, differenceInDays } from 'date-fns';
import { useTimer } from '../../context/TimerContext';
import './TaskCard.css';

const TaskCard = ({ task, onDelete, onComplete, onEdit }) => {
  const { startTimer, isRunning, currentTask } = useTimer();
  
  const handleStartTimer = () => {
    if (!isRunning) {
      startTimer(task, task.subjectId);
    }
  };
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return '#ef4444';
      case 'medium':
        return '#f59e0b';
      case 'low':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#10b981';
      case 'in-progress':
        return '#3b82f6';
      case 'pending':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const getDueDateInfo = () => {
    if (!task.dueDate) return null;
    
    const dueDate = new Date(task.dueDate);
    if (isPast(dueDate) && !isToday(dueDate)) {
      return { text: `Overdue: ${format(dueDate, 'MMM dd')}`, urgent: true };
    }
    if (isToday(dueDate)) {
      return { text: 'Due today', urgent: true };
    }
    if (isTomorrow(dueDate)) {
      return { text: 'Due tomorrow', urgent: false };
    }
    const daysUntil = differenceInDays(dueDate, new Date());
    if (daysUntil <= 7) {
      return { text: `Due in ${daysUntil} days`, urgent: false };
    }
    return { text: `Due ${format(dueDate, 'MMM dd')}`, urgent: false };
  };

  const dueDateInfo = getDueDateInfo();

  return (
    <div className={`task-card ${task.status === 'completed' ? 'completed' : ''}`}>
      <div className="task-card-header">
        <div className="task-title-section">
          <h3 className="task-title">{task.title}</h3>
          {task.subjectId && (
            <span
              className="task-subject"
              style={{ backgroundColor: task.subjectId.color || '#3b82f6' }}
            >
              {task.subjectId.name}
            </span>
          )}
        </div>
        <div className="task-actions">
          {task.status !== 'completed' && !isRunning && (
            <button
              className="btn btn-primary btn-sm"
              onClick={handleStartTimer}
              title="Start timer for this task"
            >
              Start Timer
            </button>
          )}
          {task.status !== 'completed' && (
            <button
              className="btn btn-success btn-sm"
              onClick={() => onComplete(task._id)}
            >
              Complete
            </button>
          )}
          <button className="btn btn-secondary btn-sm" onClick={() => onEdit(task)}>
            Edit
          </button>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => onDelete(task._id)}
          >
            Delete
          </button>
        </div>
      </div>

      {task.description && (
        <p className="task-description">{task.description}</p>
      )}

      <div className="task-meta">
        <span
          className="task-priority"
          style={{ color: getPriorityColor(task.priority) }}
        >
          {task.priority} priority
        </span>
        <span
          className="task-status"
          style={{ color: getStatusColor(task.status) }}
        >
          {task.status}
        </span>
        {dueDateInfo && (
          <span
            className="task-due-date"
            style={{
              color: dueDateInfo.urgent ? '#ef4444' : '#6b7280',
              fontWeight: dueDateInfo.urgent ? 600 : 400,
            }}
          >
            {dueDateInfo.text}
          </span>
        )}
        <span className="task-pomodoros">
          {task.completedPomodoros || 0} / {task.estimatedPomodoros || 1} pomodoros
        </span>
      </div>
    </div>
  );
};

export default TaskCard;

