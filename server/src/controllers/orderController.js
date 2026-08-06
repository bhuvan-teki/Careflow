const Order = require('../models/Order');
const Pharmacy = require('../models/Pharmacy');

// Create new Pharmacy Order (Steps 7 & 8)
exports.createOrder = async (req, res) => {
  try {
    const { 
      patientId = 'patient_demo_1', 
      pharmacyId, 
      pharmacyName = 'Apollo Pharmacy', 
      items = [], 
      totalAmount = 250, 
      patientDetails = {}, 
      paymentMethod = 'COD' 
    } = req.body;

    // Generate unique Order ID (e.g. CF10293)
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const orderId = `CF${randomNum}`;

    // Generate 4-digit OTP Code (Step 10)
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();

    // Assign delivery partner
    const deliveryPartners = ['CareFlow Express', 'Blinkit', 'Zepto', 'Porter'];
    const deliveryPartner = deliveryPartners[Math.floor(Math.random() * deliveryPartners.length)];

    const newOrder = new Order({
      orderId,
      patientId,
      pharmacyId: pharmacyId || 'pharmacy_1',
      pharmacyName,
      items,
      totalAmount,
      patientDetails,
      paymentMethod,
      paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Completed',
      deliveryStatus: 'Order Created',
      deliveryPartner,
      otpCode
    });

    await newOrder.save();

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: newOrder
    });
  } catch (error) {
    console.error('Create Order Error:', error);
    res.status(500).json({ success: false, message: 'Failed to create pharmacy order' });
  }
};

// Verify 4-digit Delivery OTP Code (Step 10)
exports.verifyOrderOTP = async (req, res) => {
  try {
    const { orderId, otpCode } = req.body;
    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.otpCode !== otpCode.trim()) {
      return res.status(400).json({ success: false, message: 'Invalid OTP code. Please check and try again.' });
    }

    order.isVerified = true;
    order.deliveryStatus = 'Delivered';
    order.paymentStatus = 'Completed';
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Delivery verified successfully with OTP',
      order
    });
  } catch (error) {
    console.error('Verify Order OTP Error:', error);
    res.status(500).json({ success: false, message: 'Failed to verify delivery OTP' });
  }
};

// Fetch Order Status (Step 9)
exports.getOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Get Order Status Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch order status' });
  }
};
