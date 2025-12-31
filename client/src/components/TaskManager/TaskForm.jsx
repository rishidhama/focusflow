import React, { useState, useEffect } from 'react';
import { createTask, updateTask } from '../../services/tasks';
import './TaskForm.css';

const TaskForm = ({ task, subjects, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'pending',
    estimatedPomodoros: 1,
    subjectId: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        status: task.status || 'pending',
        estimatedPomodoros: task.estimatedPomodoros || 1,
        subjectId: task.subjectId?._id || task.subjectId || '',
      });
    }
  }, [task]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const taskData = {
        ...formData,
        subjectId: formData.subjectId || null,
        estimatedPomodoros: parseInt(formData.estimatedPomodoros),
      };

      if (task) {
        await updateTask(task._id, taskData);
      } else {
        await createTask(taskData);
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="task-form-overlay" onClick={onClose}>
      <div className="task-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="task-form-header">
          <h2>{task ? 'Edit Task' : 'New Task'}</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input
              type="text"
              name="title"
              className="form-input"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              className="form-input"
              rows="3"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Subject</label>
              <select
                name="subjectId"
                className="form-input"
                value={formData.subjectId}
                onChange={handleChange}
              >
                <option value="">None</option>
                {subjects.map((subject) => (
                  <option key={subject._id} value={subject._id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Priority</label>
              <select
                name="priority"
                className="form-input"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Estimated Pomodoros</label>
            <input
              type="number"
              name="estimatedPomodoros"
              className="form-input"
              min="1"
              value={formData.estimatedPomodoros}
              onChange={handleChange}
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : task ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;

