const express = require('express');
const router = express.Router();
const Bill = require('../models/Bill');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const { protect, authorize } = require('../middleware/auth');

// Dashboard stats
router.get('/stats', protect, authorize('admin'), async (req, res) => {
  try {
    const [patients, doctors, appointments, bills, prescriptions] = await Promise.all([
      User.countDocuments({ role: 'patient' }),
      User.countDocuments({ role: 'doctor' }),
      Appointment.countDocuments({}),
      Bill.countDocuments({}),
      Prescription.countDocuments({})
    ]);

    const revenue = await Bill.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$grandTotal' } } }
    ]);

    const todayStr = new Date().toISOString().split('T')[0];
    const todayAppointments = await Appointment.countDocuments({ date: todayStr });

    res.json({
      success: true,
      data: {
        patients, doctors, appointments, bills, prescriptions,
        todayAppointments,
        totalRevenue: revenue[0]?.total || 0
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Bills view for admin
router.get('/bills', protect, authorize('admin'), async (req, res) => {
  try {
    const bills = await Bill.find()
      .populate('patient', 'name email')
      .populate('doctor', 'name')
      .populate('prescription')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: bills });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Add doctor
router.post('/doctors', protect, authorize('admin'), async (req, res) => {
  try {
    const existing = await User.findOne({ email: req.body.email });
    if (existing) return res.status(409).json({ success: false, message: 'Email already exists' });
    const doc = await User.create({ ...req.body, role: 'doctor' });
    res.status(201).json({ success: true, data: doc });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Delete user
router.delete('/users/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
