const ExistingInfluencer = require('../models/ExistingInfluencer');
const XLSX = require('xlsx');
const fs = require('fs');

const uploadExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    const influencers = data.map(row => ({
      username: row['Username'] || row['username'] || '',
      businessEmail: row['Business Email'] || row['businessEmail'] || null,
      name: row['Name'] || row['name'] || '',
      profileLink: row['Profile Link'] || row['profileLink'] || '',
      market: row['Market(Language)'] || row['market'] || null,
      status: 'pending'
    }));

    await ExistingInfluencer.insertMany(influencers);

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json({
      message: 'Excel file uploaded successfully',
      count: influencers.length
    });
  } catch (error) {
    console.error('Upload error:', error);
    // Clean up file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'Failed to upload Excel file' });
  }
};

const getInfluencers = async (req, res) => {
  try {
    const User = require('../models/User');
    const currentUser = await User.findById(req.user.id);

    let query = {};
    if (currentUser.role !== 'admin') {
      query.assignedTo = req.user.id;
    }

    const influencers = await ExistingInfluencer.find(query)
      .populate('assignedTo', 'name username email')
      .sort({ createdAt: -1 });
    res.json({ data: influencers });
  } catch (error) {
    console.error('Get influencers error:', error);
    res.status(500).json({ error: 'Failed to fetch influencers' });
  }
};

const getPendingInfluencers = async (req, res) => {
  try {
    const User = require('../models/User');
    const currentUser = await User.findById(req.user.id);

    let query = { status: 'pending' };
    if (currentUser.role !== 'admin') {
      query.assignedTo = req.user.id;
    }

    const influencers = await ExistingInfluencer.find(query)
      .populate('assignedTo', 'name username email')
      .sort({ createdAt: -1 });
    res.json({ data: influencers });
  } catch (error) {
    console.error('Get pending influencers error:', error);
    res.status(500).json({ error: 'Failed to fetch pending influencers' });
  }
};

const getAssignedInfluencers = async (req, res) => {
  try {
    const User = require('../models/User');
    const currentUser = await User.findById(req.user.id);

    let query = { status: 'assigned' };
    if (currentUser.role !== 'admin') {
      query.assignedTo = req.user.id;
    }

    const influencers = await ExistingInfluencer.find(query)
      .populate('assignedTo', 'name username email')
      .sort({ createdAt: -1 });
    res.json({ data: influencers });
  } catch (error) {
    console.error('Get assigned influencers error:', error);
    res.status(500).json({ error: 'Failed to fetch assigned influencers' });
  }
};

const getCompletedInfluencers = async (req, res) => {
  try {
    const User = require('../models/User');
    const currentUser = await User.findById(req.user.id);

    let query = { status: 'completed' };
    if (currentUser.role !== 'admin') {
      query.assignedTo = req.user.id;
    }

    const influencers = await ExistingInfluencer.find(query)
      .populate('assignedTo', 'name username email')
      .sort({ createdAt: -1 });
    res.json({ data: influencers });
  } catch (error) {
    console.error('Get completed influencers error:', error);
    res.status(500).json({ error: 'Failed to fetch completed influencers' });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assignedTo, influencerFormId } = req.body;

    if (!['pending', 'assigned', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updateData = { status, influencerFormId };

    if (assignedTo) {
      updateData.assignedTo = assignedTo;
      updateData.assignStatus = 'assigned';
    }

    const influencer = await ExistingInfluencer.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('assignedTo', 'name username email');

    if (!influencer) {
      return res.status(404).json({ error: 'Influencer not found' });
    }

    res.json({ message: 'Status updated successfully', data: influencer });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
};

const bulkAssign = async (req, res) => {
  try {
    const { ids, assignedTo } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Invalid or empty IDs array' });
    }

    if (!assignedTo) {
      return res.status(400).json({ error: 'AssignedTo is required' });
    }

    const result = await ExistingInfluencer.updateMany(
      { _id: { $in: ids } },
      {
        status: 'assigned',
        assignedTo: assignedTo,
        assignStatus: 'assigned'
      }
    );

    res.json({
      message: `${result.modifiedCount} influencers assigned successfully`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Bulk assign error:', error);
    res.status(500).json({ error: 'Failed to bulk assign influencers' });
  }
};

const getInfluencerById = async (req, res) => {
  try {
    const { id } = req.params;
    const influencer = await ExistingInfluencer.findById(id);

    if (!influencer) {
      return res.status(404).json({ error: 'Influencer not found' });
    }

    res.json({ data: influencer });
  } catch (error) {
    console.error('Get influencer by ID error:', error);
    res.status(500).json({ error: 'Failed to fetch influencer' });
  }
};

const getExistingInfluencerById = async (req, res) => {
  try {

    const influencers = await ExistingInfluencer.findById(req.id)
      .populate('assignedTo', 'name username email')
      .sort({ createdAt: -1 });

    res.json({ data: influencers });
  } catch (error) {
    console.error('Get influencers error:', error);
    res.status(500).json({ error: 'Failed to fetch influencers' });
  }
};

module.exports = {
  uploadExcel,
  getInfluencers,
  getPendingInfluencers,
  getAssignedInfluencers,
  getCompletedInfluencers,
  updateStatus,
  bulkAssign,
  getInfluencerById,
  getExistingInfluencerById
};