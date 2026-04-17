const express = require('express');
const router = express.Router();
const Bill = require('../models/Bill');
const Prescription = require('../models/Prescription');
const { protect, authorize } = require('../middleware/auth');

function makeBillNo() {
  return `BILL-${Date.now()}`;
}

function calcBill(items, consultationFee = 0, labFee = 0, otherCharges = 0, taxRate = 0, discount = 0) {
  const itemTotal = items.reduce((sum, item) => sum + ((item.quantity || 0) * (item.unitPrice || 0)), 0);
  const subtotal = itemTotal + consultationFee + labFee + otherCharges;
  const taxAmount = subtotal * (taxRate / 100);
  const grandTotal = subtotal + taxAmount - discount;
  return { subtotal, taxAmount, grandTotal };
}

// GET all bills - admin sees all, patient/doctor sees own
router.get('/', protect, async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'patient') filter.patient = req.user._id;
    if (req.user.role === 'doctor') filter.doctor = req.user._id;

    const bills = await Bill.find(filter)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name speciality')
      .populate('prescription')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: bills });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single bill
router.get('/:id', protect, async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id)
      .populate('patient', 'name email phone address age bloodGroup')
      .populate('doctor', 'name speciality phone hospital')
      .populate('prescription')
      .populate('appointment');

    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });
    res.json({ success: true, data: bill });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH update bill status
router.patch('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const bill = await Bill.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('patient', 'name email phone')
      .populate('doctor', 'name speciality');
    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });
    res.json({ success: true, data: bill });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// POST create bill from prescription
router.post('/from-prescription/:prescriptionId', protect, authorize('admin'), async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.prescriptionId)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name email phone speciality')
      .populate('appointment');

    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }

    const consultationFee = Number(req.body.consultationFee || 0);
    const labFee = Number(req.body.labFee || 0);
    const otherCharges = Number(req.body.otherCharges || 0);
    const taxRate = Number(req.body.taxRate || 0);
    const discount = Number(req.body.discount || 0);

    const items = (prescription.medicines || []).map(m => ({
      name: m.name,
      dosage: m.dosage || '',
      quantity: Number(m.quantity || 1),
      unitPrice: Number(m.unitPrice || 0),
      amount: Number(m.quantity || 1) * Number(m.unitPrice || 0)
    }));

    // Override with submitted items if provided
    const submittedItems = req.body.items;
    const finalItems = (submittedItems && submittedItems.length > 0) ? submittedItems : items;

    const totals = calcBill(finalItems, consultationFee, labFee, otherCharges, taxRate, discount);

    const bill = await Bill.create({
      billNo: makeBillNo(),
      patient: prescription.patient._id || prescription.patient,
      doctor: prescription.doctor._id || prescription.doctor,
      appointment: prescription.appointment?._id || prescription.appointment,
      prescription: prescription._id,
      items: finalItems,
      consultationFee,
      labFee,
      otherCharges,
      subtotal: totals.subtotal,
      taxRate,
      taxAmount: totals.taxAmount,
      discount,
      grandTotal: totals.grandTotal
    });

    await bill.populate(['patient', 'doctor']);
    res.status(201).json({ success: true, message: 'Bill created from prescription', data: bill });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
