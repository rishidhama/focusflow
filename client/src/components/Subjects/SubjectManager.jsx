import React, { useState, useEffect } from 'react';
import { getSubjects, createSubject, updateSubject, deleteSubject } from '../../services/subjects';
import './SubjectManager.css';

const SubjectManager = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [formData, setFormData] = useState({ name: '', color: '#3B82F6' });

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      setLoading(true);
      const data = await getSubjects();
      setSubjects(data);
    } catch (error) {
      console.error('Error loading subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSubject) {
        await updateSubject(editingSubject._id, formData);
      } else {
        await createSubject(formData);
      }
      setShowForm(false);
      setEditingSubject(null);
      setFormData({ name: '', color: '#3B82F6' });
      loadSubjects();
    } catch (error) {
      console.error('Error saving subject:', error);
    }
  };

  const handleEdit = (subject) => {
    setEditingSubject(subject);
    setFormData({ name: subject.name, color: subject.color });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      try {
        await deleteSubject(id);
        loadSubjects();
      } catch (error) {
        console.error('Error deleting subject:', error);
      }
    }
  };

  const presetColors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
  ];

  if (loading) {
    return <div className="spinner"></div>;
  }

  return (
    <div className="subject-manager">
      <div className="subject-manager-header">
        <h3>Subjects</h3>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>
          + Add Subject
        </button>
      </div>

      {showForm && (
        <div className="subject-form-card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Subject Name</label>
              <input
                type="text"
                className="form-input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Color</label>
              <div className="color-picker">
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="color-input"
                />
                <div className="preset-colors">
                  {presetColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className="color-preset"
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData({ ...formData, color })}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setShowForm(false);
                  setEditingSubject(null);
                  setFormData({ name: '', color: '#3B82F6' });
                }}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {editingSubject ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="subjects-list">
        {subjects.length === 0 ? (
          <p className="empty-message">No subjects yet. Create your first subject!</p>
        ) : (
          subjects.map((subject) => (
            <div key={subject._id} className="subject-item">
              <div className="subject-info">
                <span
                  className="subject-color"
                  style={{ backgroundColor: subject.color }}
                />
                <span className="subject-name">{subject.name}</span>
              </div>
              <div className="subject-actions">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleEdit(subject)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(subject._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SubjectManager;

