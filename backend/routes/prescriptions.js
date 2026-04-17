const express = require('express');
const router = express.Router();
const Prescription = require('../models/Prescription');
const { protect, authorize } = require('../middleware/auth');

// GET all prescriptions - admin and doctor see all, patient sees own
router.get('/', protect, async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'patient') filter.patient = req.user._id;
    if (req.user.role === 'doctor') filter.doctor = req.user._id;

    const prescriptions = await Prescription.find(filter)
      .populate('patient', 'name email phone age bloodGroup gender')
      .populate('doctor', 'name email phone speciality')
      .populate('appointment')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: prescriptions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name email phone speciality')
      .populate('appointment');
    if (!prescription) return res.status(404).json({ success: false, message: 'Prescription not found' });
    res.json({ success: true, data: prescription });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST - doctor creates prescription
router.post('/', protect, authorize('doctor', 'admin'), async (req, res) => {
  try {
    const { patient, appointment, diagnosis, notes, medicines } = req.body;
    if (!patient || !appointment) {
      return res.status(400).json({ success: false, message: 'Patient and appointment are required' });
    }
    const prescription = await Prescription.create({
      patient,
      doctor: req.user._id,
      appointment,
      diagnosis: diagnosis || '',
      notes: notes || '',
      medicines: medicines || []
    });
    await prescription.populate(['patient', 'doctor', 'appointment']);
    res.status(201).json({ success: true, data: prescription });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;
