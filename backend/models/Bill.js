const mongoose = require('mongoose');

const billItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dosage: { type: String, default: '' },
  quantity: { type: Number, default: 1 },
  unitPrice: { type: Number, default: 0 },
  amount: { type: Number, default: 0 }
}, { _id: false });

const billSchema = new mongoose.Schema({
  billNo: { type: String, required: true, unique: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  prescription: { type: mongoose.Schema.Types.ObjectId, ref: 'Prescription' },
  items: [billItemSchema],
  consultationFee: { type: Number, default: 0 },
  labFee: { type: Number, default: 0 },
  otherCharges: { type: Number, default: 0 },
  subtotal: { type: Number, default: 0 },
  taxRate: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  grandTotal: { type: Number, default: 0 },
  status: { type: String, enum: ['unpaid', 'paid', 'partially_paid'], default: 'unpaid' },
  paidAmount: { type: Number, default: 0 },
  invoiceUrl: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.models.Bill || mongoose.model('Bill', billSchema);
