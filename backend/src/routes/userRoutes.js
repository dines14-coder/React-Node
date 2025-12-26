const express = require('express');
const userController = require('../controllers/userController');
const influencerController = require('../controllers/influencerController');
const authController = require('../controllers/authController');
const otpController = require('../controllers/otpController');
const { authMiddleware } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { sendFormEmail } = require('../services/emailService');

const router = express.Router();

router.post('/login', authController.login);
router.post('/send-otp', otpController.sendOTP);
router.post('/change-password', authMiddleware, authController.changePassword);
router.get('/health', userController.getHealth);
// User management routes
router.post('/users', authMiddleware, userController.createUser);
router.get('/users', authMiddleware, userController.getAllUsers);
router.get('/users/:id', authMiddleware, userController.getUserById);
router.put('/users/:id', authMiddleware, userController.updateUser);
router.delete('/users/:id', authMiddleware, userController.deleteUser);

router.post('/influencers/onboard', upload.fields([
  { name: 'instagramGenderScreenshot', maxCount: 1 },
  { name: 'instagramAgeScreenshot', maxCount: 1 },
  { name: 'instagramDemographyScreenshot', maxCount: 1 },
  { name: 'panCardImage', maxCount: 1 },
  { name: 'bankPassbookImage', maxCount: 1 },
  { name: 'gstCertificate', maxCount: 1 }
]), influencerController.onboard);

router.get('/influencers', authMiddleware, influencerController.getAll);
router.get('/influencers/export', authMiddleware, influencerController.exportAll);
router.post('/influencers/export/filtered', authMiddleware, influencerController.exportFiltered);
router.get('/influencers/barter', authMiddleware, influencerController.getBarterInfluencers);
router.get('/influencers/:id', authMiddleware, influencerController.getById);

router.post('/send-form-email', authMiddleware, async (req, res) => {
  try {
    const { email, formUrl } = req.body;
    await sendFormEmail(email, formUrl);
    res.json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send email' });
  }
});

router.patch('/influencers/:id/status', authMiddleware, influencerController.updateStatus);

module.exports = router;