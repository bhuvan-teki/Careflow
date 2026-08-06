const express = require('express');
const { check } = require('express-validator');
const {
  patientGoogleAuth,
  clinicRegister,
  clinicLogin,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');

const router = express.Router();

router.post('/google', patientGoogleAuth);

router.post('/clinic/register', [
  check('clinicName', 'Clinic name is required').not().isEmpty(),
  check('firstName', 'First name is required').not().isEmpty(),
  check('lastName', 'Last name is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('phoneNumber', 'Phone number is required').not().isEmpty(),
  check('address', 'Address is required').not().isEmpty(),
  check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
], clinicRegister);

router.post('/clinic/login', [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists()
], clinicLogin);

router.post('/forgot-password', [
  check('email', 'Please include a valid email').isEmail(),
], forgotPassword);

router.put('/reset-password/:token', [
  check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
], resetPassword);

module.exports = router;
