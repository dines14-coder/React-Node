import React, { useState } from 'react';
import { Box, Button, Menu, MenuItem, Avatar, Typography, Divider, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { Person, Logout, ExpandMore, Lock } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { changePassword } from '../services/api';

function UserDropdown({ user, onLogout }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordChanging, setPasswordChanging] = useState(false);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    onLogout();
  };

  const handleChangePasswordClick = () => {
    handleClose();
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setPasswordModalOpen(true);
  };

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword) {
      toast.error('Please enter your current password');
      return;
    }
    if (!passwordData.newPassword) {
      toast.error('Please enter a new password');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    setPasswordChanging(true);
    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toast.success('Password changed successfully');
      setPasswordModalOpen(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to change password');
    } finally {
      setPasswordChanging(false);
    }
  };

  return (
    <Box>
      <Button
        onClick={handleClick}
        startIcon={<Person />}
        endIcon={<ExpandMore />}
        sx={{
          // bgcolor: '#f8f9fa',
          // border: '1px solid #e1e5e9',
          color: '#333',
          '&:hover': {
            bgcolor: '#e9ecef',
            borderColor: '#5386e4'
          }
        }}
      >
        {user.username}
      </Button>
      
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="body2" fontWeight={600}>{user.username}</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase' }}>
            {user.role}
          </Typography>
        </Box>
        <Divider />
        <MenuItem onClick={handleChangePasswordClick}>
          <Lock sx={{ mr: 1, fontSize: 18 }} />
          Change Password
        </MenuItem>
        <MenuItem onClick={handleLogout} sx={{ color: '#dc3545' }}>
          <Logout sx={{ mr: 1, fontSize: 18 }} />
          Logout
        </MenuItem>
      </Menu>

      <Dialog open={passwordModalOpen} onClose={() => setPasswordModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Current Password"
            type="password"
            value={passwordData.currentPassword}
            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="New Password"
            type="password"
            value={passwordData.newPassword}
            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Confirm New Password"
            type="password"
            value={passwordData.confirmPassword}
            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordModalOpen(false)} disabled={passwordChanging}>Cancel</Button>
          <Button onClick={handleChangePassword} variant="contained" disabled={passwordChanging} sx={{ bgcolor: '#5386e4' }}>
            {passwordChanging ? 'Changing...' : 'Change Password'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default UserDropdown;