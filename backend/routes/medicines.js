const express  = require('express');
const router   = express.Router();
const { Medicine } = require('../models/Others');
const { protect, authorize } = require('../middleware/auth');

// Public read
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (search)   filter.name = { $regex: search, $options: 'i' };
    const meds = await Medicine.find(filter).sort({ name: 1 });
    res.json({ success: true, count: meds.length, data: meds });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const med = await Medicine.create(req.body);
    res.status(201).json({ success: true, data: med });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const med = await Medicine.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: med });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await Medicine.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Medicine deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
