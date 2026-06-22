const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  session_id: {
    type: String,
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ['page_view', 'click'],
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Number,
    required: true,
    index: true,
  },
  x: {
    type: Number,
    default: null,
  },
  y: {
    type: Number,
    default: null,
  },
});

// Compound index for efficient session + time queries
eventSchema.index({ session_id: 1, timestamp: 1 });

module.exports = mongoose.model('Event', eventSchema);
