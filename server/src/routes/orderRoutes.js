const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.post('/create', orderController.createOrder);
router.post('/verify-otp', orderController.verifyOrderOTP);
router.get('/:orderId', orderController.getOrderStatus);

module.exports = router;
