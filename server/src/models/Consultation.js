const mongoose = require('mongoose');

const timelineItemSchema = new mongoose.Schema({
  step: { type: String, required: true },
  title: { type: String, required: true },
  status: { type: String, enum: ['completed', 'current', 'upcoming'], default: 'upcoming' },
  timestamp: { type: Date, default: Date.now }
});

const consultationSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  clinicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Clinic',
    default: null
  },
  status: {
    type: String,
    enum: ['draft', 'analyzed', 'connected', 'accepted', 'completed'],
    default: 'draft'
  },
  rawPatientInput: {
    type: String,
    required: true
  },
  aiAnalysis: {
    symptoms: [{ type: String }],
    duration: { type: String, default: 'Not specified' },
    severity: { type: String, default: 'Moderate' },
    riskFactors: [{ type: String }],
    aiSummary: { type: String, default: '' },
    recommendedDepartment: { type: String, default: 'General Physician' },
    departmentConfidence: { type: Number, default: 92 },
    departmentReason: { type: String, default: '' },
    urgency: { type: String, enum: ['Low', 'Medium', 'High', 'Emergency'], default: 'Medium' },
    urgencyReason: { type: String, default: '' },
    missingInformation: [{ type: String }],
    answeredInfo: [{
      question: String,
      answer: String
    }],
    disclaimer: { type: String, default: 'Operational summary only. Does not replace professional medical diagnosis.' }
  },
  timeline: [timelineItemSchema]
}, { timestamps: true });

module.exports = mongoose.model('Consultation', consultationSchema);
