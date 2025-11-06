const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  purpose: {
    type: String,
    required: true
  },
  faculty: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'cancelled'],
    default: 'active'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Booking', bookingSchema);