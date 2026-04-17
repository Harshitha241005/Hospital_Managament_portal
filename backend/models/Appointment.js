const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  speciality: { type: String, required: true },
  date:        { type: String, required: true },   // "YYYY-MM-DD"
  time:        { type: String, required: true },   // "10:00 AM"
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },
  condition: { type: String, default: 'General consultation' },
  notes:     { type: String, default: '' },
  report:    { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', AppointmentSchema);
