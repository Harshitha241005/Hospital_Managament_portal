const express = require('express');
const router  = express.Router();
const Appointment = require('../models/Appointment');
const { protect, authorize } = require('../middleware/auth');

// ── GET /api/appointments ──────────────────────────────────────────────────────
// Admin: all | Doctor: their own | Patient: their own
router.get('/', protect, async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'patient') filter.patient = req.user._id;
    if (req.user.role === 'doctor')  filter.doctor  = req.user._id;
    // Admin sees all

    const { status, date } = req.query;
    if (status) filter.status = status;
    if (date)   filter.date   = date;

    const apts = await Appointment.find(filter)
      .populate('patient', 'name phone age bloodGroup email')
      .populate('doctor',  'name speciality phone')
      .sort({ date: -1, createdAt: -1 });

    res.json({ success: true, count: apts.length, data: apts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/appointments ─────────────────────────────────────────────────────
// Patient books appointment
router.post('/', protect, authorize('patient', 'admin'), async (req, res) => {
  try {
    const { doctor, date, time, condition, speciality } = req.body;
    if (!doctor || !date || !time) {
      return res.status(400).json({ success: false, message: 'Doctor, date and time are required.' });
    }

    const apt = await Appointment.create({
      patient:   req.user.role === 'admin' ? req.body.patient : req.user._id,
      doctor, date, time,
      condition: condition || 'General consultation',
      speciality: speciality || 'General Medicine'
    });

    await apt.populate(['patient','doctor']);
    res.status(201).json({ success: true, data: apt });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ── GET /api/appointments/:id ──────────────────────────────────────────────────
router.get('/:id', protect, async (req, res) => {
  try {
    const apt = await Appointment.findById(req.params.id)
      .populate('patient', 'name phone age bloodGroup address')
      .populate('doctor',  'name speciality phone');
    if (!apt) return res.status(404).json({ success: false, message: 'Appointment not found.' });
    res.json({ success: true, data: apt });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── PATCH /api/appointments/:id/status ────────────────────────────────────────
// Doctor/Admin can change status; Patient can only cancel
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const apt = await Appointment.findById(req.params.id);
    if (!apt) return res.status(404).json({ success: false, message: 'Appointment not found.' });

    const { status, notes } = req.body;

    // Patient can only cancel pending/confirmed appointments
    if (req.user.role === 'patient') {
      if (apt.patient.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized.' });
      }
      if (status !== 'cancelled') {
        return res.status(403).json({ success: false, message: 'Patients can only cancel appointments.' });
      }
    }

    // Doctor can confirm, complete, cancel their own appointments
    if (req.user.role === 'doctor' && apt.doctor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    apt.status = status;
    if (notes !== undefined) apt.notes = notes;
    await apt.save();
    await apt.populate(['patient','doctor']);

    res.json({ success: true, data: apt });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ── PUT /api/appointments/:id ──────────────────────────────────────────────────
// Full update (admin/doctor)
router.put('/:id', protect, authorize('admin','doctor'), async (req, res) => {
  try {
    const apt = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate(['patient','doctor']);
    if (!apt) return res.status(404).json({ success: false, message: 'Appointment not found.' });
    res.json({ success: true, data: apt });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ── DELETE /api/appointments/:id ──────────────────────────────────────────────
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Appointment deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
