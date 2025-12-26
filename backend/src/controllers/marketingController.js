const Marketing = require('../models/Marketing');
const path = require('path');
const fs = require('fs');

// Create new marketing entry
const createMarketing = async (req, res) => {
  try {
    const { brand, product, status, campaignTitle, description } = req.body;

    const marketingData = {
      onboarderId: req.user.id,
      brand,
      product,
      campaignTitle,
      description,
      status: status || 1 // Default to 1 if not provided
    };

    // Handle file upload - store only filename
    if (req.file) {
      marketingData.fileUpload = req.file.filename;
    }

    const marketing = new Marketing(marketingData);
    await marketing.save();

    res.status(201).json({
      success: true,
      message: 'Marketing entry created successfully',
      data: marketing
    });
  } catch (error) {
    console.error('Error creating marketing entry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create marketing entry',
      error: error.message
    });
  }
};

// Get all marketing entries
const getAllMarketing = async (req, res) => {
  try {
    const marketing = await Marketing.find()
      .populate('onboarderId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: marketing
    });
  } catch (error) {
    console.error('Error fetching marketing entries:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch marketing entries',
      error: error.message
    });
  }
};

// Get marketing entry by ID
const getMarketingById = async (req, res) => {
  try {
    const { id } = req.params;
    const marketing = await Marketing.findById(id)
      .populate('onboarderId', 'name email');

    if (!marketing) {
      return res.status(404).json({
        success: false,
        message: 'Marketing entry not found'
      });
    }

    res.status(200).json({
      success: true,
      data: marketing
    });
  } catch (error) {
    console.error('Error fetching marketing entry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch marketing entry',
      error: error.message
    });
  }
};

// Update marketing entry
const updateMarketing = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Handle file upload - store only filename
    if (req.file) {
      updateData.fileUpload = req.file.filename;
    }

    const marketing = await Marketing.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('onboarderId', 'name email');

    if (!marketing) {
      return res.status(404).json({
        success: false,
        message: 'Marketing entry not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Marketing entry updated successfully',
      data: marketing
    });
  } catch (error) {
    console.error('Error updating marketing entry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update marketing entry',
      error: error.message
    });
  }
};

// Update marketing status
const updateMarketingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const marketing = await Marketing.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).populate('onboarderId', 'name email');

    if (!marketing) {
      return res.status(404).json({
        success: false,
        message: 'Marketing entry not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Marketing status updated successfully',
      data: marketing
    });
  } catch (error) {
    console.error('Error updating marketing status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update marketing status',
      error: error.message
    });
  }
};

// Delete marketing entry
const deleteMarketing = async (req, res) => {
  try {
    const { id } = req.params;

    const marketing = await Marketing.findById(id);
    if (!marketing) {
      return res.status(404).json({
        success: false,
        message: 'Marketing entry not found'
      });
    }

    // Delete associated file if exists
    if (marketing.fileUpload) {
      const filePath = path.join(__dirname, '../uploads', marketing.fileUpload);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await Marketing.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Marketing entry deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting marketing entry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete marketing entry',
      error: error.message
    });
  }
};

// Serve marketing files
const getMarketingFile = async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../uploads', filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Get file extension to determine content type
    const ext = path.extname(filename).toLowerCase();
    let contentType = 'application/octet-stream';

    switch (ext) {
      case '.pdf':
        contentType = 'application/pdf';
        break;
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      case '.webp':
        contentType = 'image/webp';
        break;
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.sendFile(filePath);
  } catch (error) {
    console.error('Error serving file:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to serve file',
      error: error.message
    });
  }
};

module.exports = {
  createMarketing,
  getAllMarketing,
  getMarketingById,
  updateMarketing,
  updateMarketingStatus,
  deleteMarketing,
  getMarketingFile
};