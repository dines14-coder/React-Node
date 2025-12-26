const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { uploadExcel, getInfluencers, getPendingInfluencers, getAssignedInfluencers, getCompletedInfluencers, updateStatus, bulkAssign, getInfluencerById } = require('../controllers/existingInfluencerController');
const { authMiddleware, checkRole } = require('../middleware/auth');

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, `existing-influencers-${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files are allowed'), false);
    }
  }
});

// POST routes
router.post('/upload', authMiddleware, checkRole('admin'), upload.single('excel'), uploadExcel);

// PATCH routes
router.patch('/bulk-assign', authMiddleware, bulkAssign);
router.patch('/:id/status', authMiddleware, updateStatus);

// GET routes (specific routes before parameterized routes)
router.get('/pending', authMiddleware, getPendingInfluencers);
router.get('/assigned', authMiddleware, getAssignedInfluencers);
router.get('/completed', authMiddleware, getCompletedInfluencers);
router.get('/:id', authMiddleware, getInfluencerById);
router.get('/', authMiddleware, getInfluencers);

module.exports = router;