const mongoose = require('mongoose');

const summarySchema = new mongoose.Schema({
  consultationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Consultation',
    required: true
  },
  clinicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Clinic',
    required: true
  },
  staffVisitNotes: {
    type: String,
    default: ''
  },
  nextOperationalActions: [{
    type: String
  }],
  clinicalSummary: {
    type: String,
    default: ''
  },
  generatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Summary', summarySchema);
