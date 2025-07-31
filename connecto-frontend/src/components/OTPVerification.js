// ===============================================
// STEP 3: Create OTP Verification Component
// Create: src/components/OTPVerification.js

import React, { useState, useEffect } from 'react';
import api from '../services/api';

const OTPVerification = ({ userId, email, onVerificationSuccess, onBack }) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [canResend, setCanResend] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  const handleVerify = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await api.verifyOTP(userId, otp);
      
      if (result.success) {
        onVerificationSuccess();
      } else {
        setError(result.message || 'Verification failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await api.resendOTP(userId);
      
      if (result.success) {
        setTimeLeft(300); // Reset timer
        setCanResend(false);
        setOtp('');
        alert('New verification code sent to your email!');
      } else {
        setError(result.message || 'Failed to resend code');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-900 rounded-xl p-8 border border-gray-800">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Check Your Email</h2>
          <p className="text-gray-400">We sent a verification code to</p>
          <p className="text-purple-400 font-medium">{email}</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg text-red-300">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Enter 6-digit code
            </label>
            <input
              type="text"
              maxLength="6"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-center text-xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={handleVerify}
            disabled={loading || otp.length !== 6}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              'Verify Account'
            )}
          </button>

          <div className="text-center">
            <p className="text-gray-400 text-sm mb-2">
              Didn't receive the code?
            </p>
            {canResend ? (
              <button
                onClick={handleResend}
                disabled={loading}
                className="text-purple-400 hover:text-purple-300 transition-colors duration-200"
              >
                Resend Code
              </button>
            ) : (
              <p className="text-gray-500 text-sm">
                Resend in {formatTime(timeLeft)}
              </p>
            )}
          </div>

          <button
            onClick={onBack}
            className="w-full text-gray-400 hover:text-white transition-colors duration-200"
          >
            Back to Sign Up
          </button>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
