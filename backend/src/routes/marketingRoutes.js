const express = require('express');
const marketingController = require('../controllers/marketingController');
const { authMiddleware } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Create new marketing entry
router.post('/', authMiddleware, upload.single('fileUpload'), marketingController.createMarketing);

// Get all marketing entries
router.get('/', authMiddleware, marketingController.getAllMarketing);

// Get marketing entry by ID
router.get('/:id', authMiddleware, marketingController.getMarketingById);

// Update marketing entry
router.put('/:id', authMiddleware, upload.single('fileUpload'), marketingController.updateMarketing);

// Update marketing status
router.patch('/:id/status', authMiddleware, marketingController.updateMarketingStatus);

// Delete marketing entry
router.delete('/:id', authMiddleware, marketingController.deleteMarketing);

// Serve marketing files
router.get('/file/:filename', marketingController.getMarketingFile);

module.exports = router;