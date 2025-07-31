// ===============================================
// STEP 3: Create routes/auth.js

const express = require('express');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const router = express.Router();

console.log('📧 Setting up email transporter...');

// Email transporter setup
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Test email connection
transporter.verify((error, success) => {
  if (error) {
    console.log('❌ Email setup error:', error.message);
  } else {
    console.log('✅ Email server ready');
  }
});

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP Email
const sendOTPEmail = async (email, otp, name) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Connecto - Verify Your Account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #000; color: #fff; padding: 20px; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="width: 60px; height: 60px; background: #8B5CF6; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
            <span style="color: white; font-size: 24px; font-weight: bold;">C</span>
          </div>
          <h1 style="color: #8B5CF6; margin: 0;">Welcome to Connecto!</h1>
        </div>
        
        <h2 style="color: #fff;">Hi ${name}! 👋</h2>
        <p style="color: #ccc; font-size: 16px;">Thank you for joining Connecto. To complete your registration, please use the verification code below:</p>
        
        <div style="background: #1a1a1a; padding: 30px; text-align: center; margin: 30px 0; border-radius: 8px; border: 2px solid #8B5CF6;">
          <h1 style="color: #8B5CF6; font-size: 36px; margin: 0; letter-spacing: 3px;">${otp}</h1>
        </div>
        
        <p style="color: #ccc;">⏰ This code will expire in <strong style="color: #8B5CF6;">5 minutes</strong>.</p>
        <p style="color: #ccc;">If you didn't create a Connecto account, please ignore this email.</p>
        
        <hr style="border: 1px solid #333; margin: 30px 0;">
        <p style="color: #888; font-size: 14px; text-align: center;">
          © 2024 Connecto. Made with ❤️
        </p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
  console.log(`📧 OTP email sent to ${email}`);
};

// @route   POST /api/auth/signup
// @desc    Register user and send OTP
// @access  Public
router.post('/signup', async (req, res) => {
  console.log('📝 Signup request received:', req.body);
  
  try {
    const { firstName, lastName, email, password } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please enter a valid email address' 
      });
    }

    // Password validation
    if (password.length < 8) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 8 characters long' 
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'An account with this email already exists' 
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    console.log(`🔐 Generated OTP for ${email}: ${otp}`);

    // Create user
    const user = new User({
      name: `${firstName.trim()} ${lastName.trim()}`,
      email: email.toLowerCase(),
      password,
      otp,
      otpExpires,
      isVerified: false
    });

    await user.save();
    console.log(`✅ User created: ${user._id}`);

    // Send OTP email
    try {
      await sendOTPEmail(email, otp, user.name);
    } catch (emailError) {
      console.error('📧 Email sending error:', emailError);
      // Don't fail the signup if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Account created successfully! Please check your email for the verification code.',
      userId: user._id,
      email: user.email
    });

  } catch (error) {
    console.error('❌ Signup error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error. Please try again.' 
    });
  }
});

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP and activate account
// @access  Public
router.post('/verify-otp', async (req, res) => {
  console.log('🔐 OTP verification request:', req.body);
  
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID and OTP are required' 
      });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Check if already verified
    if (user.isVerified) {
      return res.status(400).json({ 
        success: false, 
        message: 'Account is already verified' 
      });
    }

    // Check OTP
    if (user.otp !== otp) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid verification code' 
      });
    }

    // Check OTP expiration
    if (new Date() > user.otpExpires) {
      return res.status(400).json({ 
        success: false, 
        message: 'Verification code has expired. Please request a new one.' 
      });
    }

    // Verify user
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    console.log(`✅ User verified: ${user.email}`);

    res.json({
      success: true,
      message: 'Account verified successfully! You can now sign in.'
    });

  } catch (error) {
    console.error('❌ OTP verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error. Please try again.' 
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  console.log('🔑 Login request for:', req.body.email);
  
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // Check if verified
    if (!user.isVerified) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please verify your email before signing in',
        needsVerification: true,
        userId: user._id
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // Generate token
    const token = generateToken(user._id);

    console.log(`✅ Login successful: ${user.email}`);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        isVerified: user.isVerified
      }
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error. Please try again.' 
    });
  }
});

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Auth routes are working!' });
});

module.exports = router;