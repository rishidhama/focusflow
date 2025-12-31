import React, { useState, useEffect } from 'react';
import { getTasks, deleteTask, completeTask } from '../../services/tasks';
import { getSubjects } from '../../services/subjects';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';
import './TaskList.css';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tasksData, subjectsData] = await Promise.all([
        getTasks(filter !== 'all' ? { status: filter } : {}),
        getSubjects(),
      ]);
      setTasks(tasksData);
      setSubjects(subjectsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(id);
        loadData();
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const handleComplete = async (id) => {
    try {
      await completeTask(id);
      loadData();
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingTask(null);
    loadData();
  };

  if (loading) {
    return <div className="spinner"></div>;
  }

  return (
    <div className="task-list-container">
      <div className="task-list-header">
        <h2>Tasks</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          + New Task
        </button>
      </div>

      <div className="task-filters">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button
          className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending
        </button>
        <button
          className={`filter-btn ${filter === 'in-progress' ? 'active' : ''}`}
          onClick={() => setFilter('in-progress')}
        >
          In Progress
        </button>
        <button
          className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          Completed
        </button>
      </div>

      {showForm && (
        <TaskForm
          task={editingTask}
          subjects={subjects}
          onClose={handleFormClose}
        />
      )}

      <div className="task-list">
        {tasks.length === 0 ? (
          <p className="empty-message">No tasks found. Create your first task!</p>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onDelete={handleDelete}
              onComplete={handleComplete}
              onEdit={handleEdit}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default TaskList;

