const express  = require('express');
const router   = express.Router();
const { Disease } = require('../models/Others');
const { protect, authorize } = require('../middleware/auth');

// Public
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    const filter = search ? { $or: [{ name: { $regex: search, $options: 'i' } }, { specialist: { $regex: search, $options: 'i' } }] } : {};
    const diseases = await Disease.find(filter).sort({ name: 1 });
    res.json({ success: true, count: diseases.length, data: diseases });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const d = await Disease.create(req.body);
    res.status(201).json({ success: true, data: d });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await Disease.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Disease entry deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
