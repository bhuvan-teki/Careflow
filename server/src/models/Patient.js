const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  googleId: {
    type: String,
    sparse: true
  },
  avatarUrl: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Patient', patientSchema);
