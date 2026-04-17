const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const { protect, authorize } = require('../middleware/auth');

// GET /api/doctor/appointments - doctor's own appointments
router.get('/appointments', protect, authorize('doctor'), async (req, res) => {
  try {
    const appointments = await Appointment.find({ doctor: req.user.id })
      .populate('patient', 'name email phone age bloodGroup gender address')
      .populate('doctor', 'name email phone speciality')
      .sort({ date: -1, createdAt: -1 });

    res.json({ success: true, count: appointments.length, data: appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
