import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, IconButton, Paper } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import InfluencerOnboard from './InfluencerOnboard';

function AddInfluencer() {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/onboard-forms');
  };

  const handleBack = () => {
    navigate('/onboard-forms');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton
          onClick={handleBack}
          sx={{ mr: 2, bgcolor: '#f8f9fa', '&:hover': { bgcolor: '#e9ecef' } }}
        >
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          Add New Influencer
        </Typography>
      </Box>
      <Paper sx={{ p: 3, boxShadow: 2 }}>
        <InfluencerOnboard onSuccess={handleSuccess} />
      </Paper>
    </Box>
  );
}

export default AddInfluencer;