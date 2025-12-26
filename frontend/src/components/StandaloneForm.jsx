import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Container, Paper, Typography, IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';
import InfluencerOnboard from './InfluencerOnboard';
import { influencerLogo } from '../assets/images';

function StandaloneForm() {
  const { id } = useParams();
  const { type } = useParams();
  const { existingId } = useParams();
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/onboard-forms');
  };

  const handleClose = () => {
    navigate('/onboard-forms');
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      bgcolor: '#edf4fd',
      py: 4
    }}>
      <Container maxWidth="md">
        {/* Header */}


        {/* Form Container */}
        <Paper
          elevation={2}
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
            bgcolor: 'white'
          }}
        >
          <Box sx={{
            bgcolor: '#5386e4',
            color: 'white',
            p: 4,
            textAlign: 'center'
          }}>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
              Cavin Kare - Influencer's OnBoarding Form
            </Typography>
            {/* <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Fill out this form to get started with your influencer journey
            </Typography> */}
          </Box>

          <Box sx={{ p: 4 }}>
            <InfluencerOnboard onboardedId={id} type={type} existingId={existingId} onSuccess={handleSuccess} />
          </Box>
        </Paper>

        {/* Footer */}
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="body2" color="text.secondary">
            Powered by HEPL
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default StandaloneForm;