const express = require('express');
const router = express.Router();

const {login, signup, logout, forgotPassword, resetPassword, sendOTP, verifyOTP} = require('../controllers/Auth');
const {auth, isCustomer, isAdmin} = require('../middlewares/auth');


// auth routes 
router.post('/login', login);
router.post('/signup', signup);
router.post("/logout", logout);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);

module.exports = router;