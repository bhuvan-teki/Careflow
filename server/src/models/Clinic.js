const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const clinicSchema = new mongoose.Schema({
  clinicName: {
    type: String,
    required: true,
    trim: true
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
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true,
    select: false // Do not return password by default
  },
  rating: {
    type: Number,
    default: 4.9
  },
  distance: {
    type: String,
    default: '1.2 miles'
  },
  openStatus: {
    type: String,
    default: 'Open Now'
  },
  departments: [{
    type: String
  }],
  estimatedWaitTime: {
    type: String,
    default: '10-15 mins'
  },
  logoUrl: {
    type: String,
    default: ''
  }
}, { timestamps: true });

// Hash password before saving
clinicSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password
clinicSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Clinic', clinicSchema);
