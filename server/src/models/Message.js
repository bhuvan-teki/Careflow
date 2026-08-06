const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  consultationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Consultation',
    required: true
  },
  senderId: {
    type: String,
    required: true
  },
  senderRole: {
    type: String,
    enum: ['patient', 'clinic', 'system', 'ai'],
    required: true
  },
  text: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
