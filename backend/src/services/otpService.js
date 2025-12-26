const http = require('http');
const querystring = require('querystring');

const sendOTP = async (mobileNumber, otp) => {
  return new Promise((resolve) => {
    try {
      const message = `To continue your CavinKare influencer onboarding, please verify your mobile number. Your OTP is ${otp}. Enter this OTP to access the form shared by the CavinKare team`;
      
      const params = querystring.stringify({
        username: process.env.SMS_USERNAME,
        password: process.env.SMS_PASSWORD,
        to: mobileNumber,
        message: message
      });
      
      const url = `http://www.agilecomm.co.in/aglcsms/sendsms?${params}`;
      
      http.get(url, (response) => {
        if (response.statusCode === 200) {
          resolve({ success: true, message: 'OTP sent successfully' });
        } else {
          resolve({ success: false, message: 'Failed to send OTP' });
        }
      }).on('error', (error) => {
        console.error('SMS send error:', error.message);
        resolve({ success: false, message: 'Failed to send OTP', error: error.message });
      });
    } catch (error) {
      console.error('SMS send error:', error.message);
      resolve({ success: false, message: 'Failed to send OTP', error: error.message });
    }
  });
};

module.exports = { sendOTP };
