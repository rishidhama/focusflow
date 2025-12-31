const Subject = require('../models/Subject');

// Get all subjects for user
const getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find({ userId: req.userId }).sort({
      createdAt: -1,
    });
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create subject
const createSubject = async (req, res) => {
  try {
    const subject = await Subject.create({
      ...req.body,
      userId: req.userId,
    });
    res.status(201).json(subject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update subject
const updateSubject = async (req, res) => {
  try {
    const subject = await Subject.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    res.json(subject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete subject
const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    res.json({ message: 'Subject deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
};

