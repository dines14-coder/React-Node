import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Chip,
  Button
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Visibility } from '@mui/icons-material';
import { getInfluencers } from '../services/api';

function SubmittedForms() {
  const [influencers, setInfluencers] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchInfluencers();
  }, []);

  const fetchInfluencers = async () => {
    setLoading(true);
    try {
      const response = await getInfluencers();
      setInfluencers(response.data || response);
    } catch (error) {
      console.error('Failed to fetch influencers:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const columns = [
    { field: 'sno', headerName: 'SNO', width: 80 },
    { field: 'name', headerName: 'Name', width: 150 },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'socialMediaPlatforms', headerName: 'Platform', width: 150 },
    { field: 'category', headerName: 'Category', width: 120 },
    {
      field: 'followers',
      headerName: 'Followers',
      width: 120,
      renderCell: (params) => {
        const instagram = params.row.instagramFollowers || 0;
        const youtube = params.row.youtubeFollowers || 0;
        const total = Math.max(instagram, youtube);
        return total > 0 ? total.toLocaleString() : '-';
      }
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={getStatusColor(params.value)}
          size="small"
          sx={{ textTransform: 'capitalize' }}
        />
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      renderCell: (params) => (
        <Button
          size="small"
          startIcon={<Visibility />}
          onClick={() => navigate(`/influencer/${params.row._id}`)}
          sx={{ color: '#5386e4' }}
        >
          View
        </Button>
      )
    }
  ];

  const rows = influencers.map((influencer, index) => ({
    id: influencer._id,
    sno: index + 1,
    name: influencer.name,
    email: influencer.email,
    socialMediaPlatforms: influencer.socialMediaPlatforms,
    category: influencer.category,
    status: influencer.status,
    instagramFollowers: influencer.instagramFollowers,
    youtubeFollowers: influencer.youtubeFollowers,
    _id: influencer._id
  }));

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" component="h1" sx={{ fontWeight: 600, mb: 3 }}>
        My Onboarded Influencers
      </Typography>
      
      <DataGrid
        columns={columns}
        rows={loading ? [] : rows}
        loading={loading}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 },
          },
        }}
        pageSizeOptions={[10, 20]}
        disableRowSelectionOnClick
        autoHeight
        sx={{
          boxShadow: 2,
          backgroundColor: 'white',
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#f8f9fa'
          }
        }}
      />
    </Box>
  );
}

export default SubmittedForms;