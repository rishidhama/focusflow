const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true,
    },
    color: {
      type: String,
      default: '#3B82F6', // Default blue color
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid color format'],
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
subjectSchema.index({ userId: 1 });

module.exports = mongoose.model('Subject', subjectSchema);

