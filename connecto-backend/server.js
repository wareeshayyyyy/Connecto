// ===============================================
// STEP 1: Update your server.js to add auth routes
// Replace your current server.js with this:

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

console.log('🔄 Starting Connecto Backend...');

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json()); // This is important for parsing POST requests
console.log("MONGO_URI from .env:", process.env.MONGO_URI);

// Database connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));

// Test route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Connecto Backend API is running!',
    endpoints: {
      signup: 'POST /api/auth/signup',
      verifyOtp: 'POST /api/auth/verify-otp',
      login: 'POST /api/auth/login',
      resendOtp: 'POST /api/auth/resend-otp'
    },
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Test at: http://localhost:${PORT}`);
  console.log(`🔗 Ready for API calls!`);
});


