const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },

  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
  },

  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },

  role: {
    type: String,
    enum: ['patient', 'doctor', 'admin'],
    default: 'patient'
  },

  phone: { type: String, trim: true },

  // Patient-specific fields
  age: { type: Number },
  bloodGroup: { type: String, enum: ['A+','A-','B+','B-','O+','O-','AB+','AB-',''] },
  address: { type: String },
  gender: { type: String, enum: ['Male','Female','Other',''] },

  // Doctor-specific fields
speciality: { type: String },
experience: { type: Number },
hospital: { type: String },
licenseNo: { type: String },

rating: { type: Number, default: 4.5, min: 0, max: 5 },
available: { type: Boolean, default: true },
slots: [{ type: String }],
  // Reset password
  resetToken: String,
  resetTokenExpire: Date

}, { timestamps: true });


// ✅ PASSWORD HASHING (FIXED SAFETY)
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});


// ✅ PASSWORD MATCH METHOD (SAFE)
UserSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};


// EXPORT
module.exports = mongoose.model('User', UserSchema);