import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { Home, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

function NotFound() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        bgcolor: '#f5f5f5',
        p: 3
      }}
    >
      <Paper
        sx={{
          p: 6,
          textAlign: 'center',
          maxWidth: 500,
          width: '100%'
        }}
      >
        <Typography
          variant="h1"
          sx={{
            fontSize: '6rem',
            fontWeight: 'bold',
            color: '#5386e4',
            mb: 2
          }}
        >
          404
        </Typography>
        <Typography
          variant="h4"
          sx={{
            mb: 2,
            color: '#333'
          }}
        >
          Page Not Found
        </Typography>
        <Typography
          variant="body1"
          sx={{
            mb: 4,
            color: '#666'
          }}
        >
          The page you are looking for doesn't exist or has been moved.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="contained"
            startIcon={<Home />}
            onClick={() => navigate('/')}
            sx={{
              bgcolor: '#5386e4',
              '&:hover': { bgcolor: '#4a7bd9' }
            }}
          >
            Go Home
          </Button>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate(-1)}
            sx={{
              borderColor: '#5386e4',
              color: '#5386e4',
              '&:hover': {
                borderColor: '#4a7bd9',
                bgcolor: '#f0f7ff'
              }
            }}
          >
            Go Back
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

export default NotFound;