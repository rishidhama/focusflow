const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      default: null,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      default: null,
    },
    duration: {
      type: Number, // in minutes
      required: true,
      min: 1,
    },
    type: {
      type: String,
      enum: ['focus', 'short-break', 'long-break'],
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    endedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
sessionSchema.index({ userId: 1 });
sessionSchema.index({ startedAt: -1 });
sessionSchema.index({ subjectId: 1 });

module.exports = mongoose.model('Session', sessionSchema);

