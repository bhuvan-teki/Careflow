const mongoose = require('mongoose');

const pharmacySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    default: 4.8
  },
  openStatus: {
    type: String,
    enum: ['Open 24/7', 'Open Now', 'Closed'],
    default: 'Open 24/7'
  },
  distance: {
    type: String,
    default: '0.8 miles'
  },
  availableMedicines: [{
    type: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('Pharmacy', pharmacySchema);
