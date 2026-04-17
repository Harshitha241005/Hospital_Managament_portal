const express = require('express');
const router = express.Router();
const Report = require('../models/Report');

router.get('/', async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('patient', 'name email phone')
      .populate('doctor', 'name email phone speciality')
      .populate('uploadedBy', 'name email');
    res.json({ success: true, data: reports });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const report = await Report.create(req.body);
    res.status(201).json({ success: true, message: 'Report uploaded', data: report });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Report.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Report not found' });
    res.json({ success: true, message: 'Report deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;