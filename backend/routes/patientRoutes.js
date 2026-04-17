const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const Bill = require('../models/Bill');

// GET /api/patient/appointments
router.get('/appointments', protect, authorize('patient'), async (req, res) => {
  try {
    const appointments = await Appointment.find({ patient: req.user.id })
      .populate('doctor', 'name speciality phone hospital')
      .sort({ date: -1, createdAt: -1 });
    res.json({ success: true, data: appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/patient/prescriptions
router.get('/prescriptions', protect, authorize('patient'), async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ patient: req.user.id })
      .populate('doctor', 'name speciality')
      .populate('appointment')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: prescriptions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/patient/bills
router.get('/bills', protect, authorize('patient'), async (req, res) => {
  try {
    const bills = await Bill.find({ patient: req.user.id })
      .populate('patient', 'name email phone address age bloodGroup')
      .populate('doctor', 'name speciality hospital')
      .populate('prescription')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: bills });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
