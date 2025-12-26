const { sendOTP } = require('../services/otpService');

const otpController = {
  sendOTP: async (req, res) => {
    try {
      const { mobileNumber, otp } = req.body;

      if (!mobileNumber || !otp) {
        return res.status(400).json({ error: 'Mobile number and OTP are required' });
      }

      if (mobileNumber.length !== 10 || !/^\d{10}$/.test(mobileNumber)) {
        return res.status(400).json({ error: 'Invalid mobile number' });
      }

      const result = await sendOTP(mobileNumber, otp);

      if (result.success) {
        return res.json({ success: true, message: result.message });
      } else {
        return res.status(500).json({ success: false, error: result.message });
      }
    } catch (error) {
      console.error('OTP send error:', error);
      res.status(500).json({ success: false, error: 'Failed to send OTP' });
    }
  }
};

module.exports = otpController;
