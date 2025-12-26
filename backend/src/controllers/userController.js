const User = require('../models/User');

const userController = {
  getAllUsers: async (req, res) => {
    try {
      const users = await User.find().select('-password');
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  },

  getUserById: async (req, res) => {
    try {
      const user = await User.findById(req.params.id).select('-password');
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  },

  getHealth: (req, res) => {
    res.json({ message: 'Backend is running with MongoDB!' });
  },

  createUser: async (req, res) => {
    try {
      const { name, email, username, password, role } = req.body;
      const newUser = new User({ name, email, username, password, role });
      await newUser.save();
      res.status(201).json({ message: 'User created successfully', user: newUser });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to create user' });
    }
  },

  updateUser: async (req, res) => {
    try {
      const { name, email, username, password, role } = req.body;
      const updateData = { name, email, username, role };
      if (password) {
        updateData.password = password;
      }
      const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select('-password');
      if (!updatedUser) return res.status(404).json({ error: 'User not found' });
      res.json(updatedUser);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to update user' });
    }
  },

  deleteUser: async (req, res) => {
    try {
      const deletedUser = await User.findByIdAndDelete(req.params.id);
      if (!deletedUser) return res.status(404).json({ error: 'User not found' });
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to delete user' });
    }
  }
};

module.exports = userController;