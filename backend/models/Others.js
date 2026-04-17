const mongoose = require('mongoose');

const MedicineSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  stock: { type: Number, default: 0 },
  price: { type: Number, required: true },
  unit: { type: String, default: 'tablet' }
}, { timestamps: true });

const DiseaseSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  specialist: { type: String },
  symptoms: { type: String },
  medicines: [{ type: String }]
}, { timestamps: true });

module.exports = {
  Medicine: mongoose.models.Medicine || mongoose.model('Medicine', MedicineSchema),
  Disease: mongoose.models.Disease || mongoose.model('Disease', DiseaseSchema)
};
