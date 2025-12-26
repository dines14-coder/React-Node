import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  CircularProgress
} from '@mui/material';
import { toast } from 'react-toastify';
import { sendOtp } from '../services/api';

function OTPVerification({ onVerified }) {
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const generateOTP = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  const sendOTPHandler = async () => {
    if (!mobile || mobile.length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    const newOtp = generateOTP();
    setGeneratedOtp(newOtp);

    try {
      const response = await sendOtp(mobile, newOtp);

      if (response.data.success) {
        setOtpSent(true);
        toast.success('OTP sent successfully!');
      } else {
        toast.error(response.data.error || 'Failed to send OTP. Please try again.');
      }
    } catch (error) {
      console.error('OTP send error:', error);
      toast.error(error.response?.data?.error || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = () => {
    if (!otp) {
      toast.error('Please enter OTP');
      return;
    }

    if (otp === generatedOtp) {
      toast.success('Mobile number verified successfully!');
      onVerified(mobile);
    } else {
      toast.error('Invalid OTP. Please try again.');
    }
  };

  const resendOTP = () => {
    setOtp('');
    sendOTPHandler();
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="p" sx={{ color: '#fd1a40e8', mb: 5 }}>
        *Access to the form will be enabled upon successful OTP verification.
      </Typography>
      <Typography variant="h6" sx={{ color: '#5386e4', mb: 2,mt:2, fontWeight: 600 }}>
        Mobile Verification
      </Typography>

      {!otpSent ? (
        <>
          <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
            Enter your mobile number to receive OTP
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
            <TextField
              label="Mobile Number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="Enter 10-digit mobile number"
              sx={{ width: 250 }}
            />

            <Button
              variant="contained"
              onClick={sendOTPHandler}
              disabled={loading || mobile.length !== 10}
              sx={{
                bgcolor: '#5386e4',
                '&:hover': { bgcolor: '#4a7bd9' },
                py: 1.5,
                px: 3
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Send OTP'}
            </Button>
          </Box>
        </>
      ) : (
        <>
          <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
            Enter the OTP sent to +91 {mobile}
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end', mb: 2 }}>
            <TextField
              label="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="Enter 4-digit OTP"
              sx={{ width: 150 }}
            />

            <Button
              variant="contained"
              onClick={verifyOTP}
              sx={{
                bgcolor: '#5386e4',
                '&:hover': { bgcolor: '#4a7bd9' },
                py: 1.5,
                px: 3
              }}
            >
              Verify OTP
            </Button>
          </Box>

          <Button
            variant="text"
            onClick={resendOTP}
            sx={{ color: '#5386e4' }}
          >
            Resend OTP
          </Button>
        </>
      )}
    </Box>
  );
}

export default OTPVerification;