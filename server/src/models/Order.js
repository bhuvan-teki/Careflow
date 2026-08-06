const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  patientId: {
    type: String,
    required: true
  },
  pharmacyId: {
    type: String,
    required: true
  },
  pharmacyName: {
    type: String,
    required: true
  },
  items: [
    {
      name: String,
      quantity: Number,
      price: Number
    }
  ],
  totalAmount: {
    type: Number,
    required: true
  },
  patientDetails: {
    name: String,
    phone: String,
    deliveryAddress: String,
    age: String
  },
  paymentMethod: {
    type: String,
    enum: ['UPI', 'Card', 'Wallet', 'COD'],
    default: 'COD'
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Completed'],
    default: 'Pending'
  },
  deliveryStatus: {
    type: String,
    enum: ['Order Created', 'Pharmacy Packed', 'Out for Delivery', 'Delivered'],
    default: 'Order Created'
  },
  deliveryPartner: {
    type: String,
    default: 'CareFlow Express'
  },
  otpCode: {
    type: String,
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
