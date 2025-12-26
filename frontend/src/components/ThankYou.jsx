import React from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent
} from '@mui/material';
import { CheckCircle } from '@mui/icons-material';

function ThankYou({ onClose }) {
  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '60vh',
      p: 3 
    }}>
      <Card sx={{ maxWidth: 500, textAlign: 'center', boxShadow: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <CheckCircle sx={{ fontSize: 80, color: '#4caf50', mb: 2 }} />
          
          <Typography variant="h4" sx={{ color: '#5386e4', mb: 2, fontWeight: 600 }}>
            Thank You!
          </Typography>
          
          <Typography variant="h6" sx={{ mb: 3, color: '#666' }}>
            Your application has been submitted successfully
          </Typography>
          
          {/* <Typography variant="body1" sx={{ mb: 4, color: '#888', lineHeight: 1.6 }}>
            We have received your influencer onboarding application. Our team will review your submission and get back to you within 2-3 business days.
          </Typography>
           */}
          {/* <Button
            variant="contained"
            size="large"
            onClick={onClose}
            sx={{
              bgcolor: '#5386e4',
              '&:hover': { bgcolor: '#4a7bd9' },
              px: 4,
              py: 1.5
            }}
          >
            Submit Another Application
          </Button> */}
        </CardContent>
      </Card>
    </Box>
  );
}

export default ThankYou;