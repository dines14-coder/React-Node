import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Chip,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Visibility, Edit, FileDownload } from '@mui/icons-material';
import { getNegotiationPending, getNegotiationCompleted, exportNegotiationPending, exportNegotiationCompleted } from '../services/api';

function NegotiationCost() {
  const [pendingInfluencers, setPendingInfluencers] = useState([]);
  const [completedInfluencers, setCompletedInfluencers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedInfluencer, setSelectedInfluencer] = useState(null);
  const [costData, setCostData] = useState({
    reelCost: '',
    youtubeShortsCoast: '',
    youtubeVideoCost: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchPendingInfluencers();
    fetchCompletedInfluencers();
  }, []);

  const fetchPendingInfluencers = async () => {
    setLoading(true);
    try {
      const response = await getNegotiationPending();
      setPendingInfluencers(response.data.data);
    } catch (error) {
      console.error('Failed to fetch pending influencers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompletedInfluencers = async () => {
    try {
      const response = await getNegotiationCompleted();
      setCompletedInfluencers(response.data.data);
    } catch (error) {
      console.error('Failed to fetch completed influencers:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'negotiated': return 'success';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const pendingColumns = [
    { field: 'sno', headerName: 'SNO', flex: 0.4, minWidth: 80 },
    { field: 'name', headerName: 'Influencer Name', flex: 1, minWidth: 150 },

    {
      field: "totalcostinstagram",
      headerName: 'Total Cost Instagram',
      flex: 1,
      minWidth: 150,
      renderCell: (params) => {
        const value = params.row?.reelCost;
        if (!value || isNaN(value)) return "-";
        return `₹${Number(value).toLocaleString()}`;
      }
    },
    {
      field: "totalcostyoutube",
      headerName: "Total Cost Youtube",
      flex: 1,
      minWidth: 150,
      renderCell: (params) => {
        const shorts = params.row?.youtubeShortsCost;
        const video = params.row?.youtubeVideoCost;
        if (!shorts || !video) return "-";
        const total = shorts + video;
        return `₹${total.toLocaleString()}`;
      }
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 0.8,
      minWidth: 120,
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
      flex: 0.8,
      minWidth: 150,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size="small"
            startIcon={<Edit />}
            onClick={() => handleEditClick(params.row)}
            sx={{ color: '#5386e4' }}
          >
            Edit
          </Button>
        </Box>
      )
    }
  ];


  const negotiatedColumns = [
    { field: 'sno', headerName: 'SNO', flex: 0.4, minWidth: 80 },
    { field: 'name', headerName: 'Influencer Name', flex: 1, minWidth: 150 },

    {
      field: "totalcostinstagram",
      headerName: 'Total Cost Instagram',
      flex: 1,
      minWidth: 160,
      cellClassName: 'instagram-column',
      renderCell: (params) => {
        const value = params.row?.reelCost;
        if (!value || isNaN(value)) return "-";
        return `₹${Number(value).toLocaleString()}`;
      }
    },
    {
      field: "negotiatedreelCost",
      headerName: 'Negotiated Total (Instagram)',
      flex: 1,
      minWidth: 230,
      cellClassName: 'instagram-column',
      renderCell: (params) => {
        const value = params.row?.negotiatedreelCost;
        if (!value || isNaN(value)) return "-";
        return `₹${Number(value).toLocaleString()}`;
      }
    },
    {
      field: "savingsCostInstagram",
      headerName: 'Savings Cost Instagram',
      flex: 1,
      minWidth: 200,
      cellClassName: 'instagram-column',
      renderCell: (params) => {
        const reelCostVal = params.row?.reelCost;
        const negotiatedVal = params.row?.negotiatedreelCost;

        if (!reelCostVal || isNaN(reelCostVal)) return "-";

        let value = reelCostVal - negotiatedVal;
        return `₹${Number(value).toLocaleString()}`;
      }
    },
    {
      field: "savingsInstagramPercentage",
      headerName: 'Savings Percentage Instagram',
      flex: 1,
      minWidth: 230,
      cellClassName: 'instagram-column',
      renderCell: (params) => {
        const reelCostVal = params.row?.reelCost;
        const negotiatedVal = params.row?.negotiatedreelCost;

        if (!reelCostVal || isNaN(reelCostVal)) return "-";

        let savingsCost = reelCostVal - negotiatedVal;
        let percentage = ((savingsCost / reelCostVal) * 100).toFixed(2);
        return `${Number(percentage).toLocaleString()}%`;
      }
    },
    {
      field: "totalcostyoutube",
      headerName: "Total Cost Youtube",
      flex: 1,
      minWidth: 150,
      cellClassName: 'youtube-column',
      renderCell: (params) => {
        const shorts = params.row?.youtubeShortsCost;
        const video = params.row?.youtubeVideoCost;
        if (!shorts || !video) return "-";
        const total = shorts + video;
        return `₹${total.toLocaleString()}`;
      }
    },
    {
      field: "negotiatedyoutube",
      headerName: "Negotiated Total (YouTube)",
      flex: 1,
      minWidth: 230,
      cellClassName: 'youtube-column',
      renderCell: (params) => {
        const shorts = params.row?.negotiatedYoutubeShortsCost;
        const video = params.row?.negotiatedYoutubeVideoCost;
        if (!shorts || !video) return "-";
        const total = shorts + video;
        return `₹${total.toLocaleString()}`;
      }
    },
    {
      field: "savingsCostYoutube",
      headerName: 'Savings Cost YouTube',
      flex: 1,
      minWidth: 200,
      cellClassName: 'youtube-column',
      renderCell: (params) => {
        const shorts = params.row?.youtubeShortsCost;
        const video = params.row?.youtubeVideoCost;
        if (!shorts || !video) return "-";
        const originalTotal = shorts + video;

        const negotiatedShorts = params.row?.negotiatedYoutubeShortsCost;
        const negotiatedVideo = params.row?.negotiatedYoutubeVideoCost;
        if (!negotiatedShorts || !negotiatedVideo) return "-";
        const negotiatedTotal = negotiatedShorts + negotiatedVideo;

        let value = originalTotal - negotiatedTotal;
        return `₹${Number(value).toLocaleString()}`;
      }
    },
    {
      field: "savingsPercentageYoutube",
      headerName: 'Savings Percentage YouTube',
      flex: 1,
      minWidth: 230,
      cellClassName: 'youtube-column',
      renderCell: (params) => {
        const shorts = params.row?.youtubeShortsCost;
        const video = params.row?.youtubeVideoCost;
        if (!shorts || !video) return "-";
        const originalTotal = shorts + video;

        const negotiatedShorts = params.row?.negotiatedYoutubeShortsCost;
        const negotiatedVideo = params.row?.negotiatedYoutubeVideoCost;
        if (!negotiatedShorts || !negotiatedVideo) return "-";
        const negotiatedTotal = negotiatedShorts + negotiatedVideo;

        let SavingsValue = originalTotal - negotiatedTotal;
        let percentage = ((SavingsValue / originalTotal) * 100).toFixed(2);
        return `${Number(percentage).toLocaleString()}%`;
      }
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 0.8,
      minWidth: 120,
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

  const pendingRows = pendingInfluencers.map((influencer, index) => ({
    id: influencer._id,
    sno: index + 1,
    name: influencer.name,
    email: influencer.email,
    platformType: influencer.platformType,
    reelCost: influencer.reelCost,
    youtubeVideoCost: influencer.youtubeVideoCost,
    youtubeShortsCost: influencer.youtubeShortsCost,
    // followers: (influencer.instagramFollowers || influencer.youtubeFollowers || 0).toLocaleString(),
    category: influencer.category,
    status: 'pending',
    _id: influencer._id
  }));

  const negotiatedRows = completedInfluencers.map((influencer, index) => ({
    id: influencer._id,
    sno: index + 1,
    name: influencer.name,
    email: influencer.email,
    platformType: influencer.platformType,
    reelCost: influencer?.reelCost,
    youtubeVideoCost: influencer?.youtubeVideoCost,
    youtubeShortsCost: influencer?.youtubeShortsCost,
    negotiatedreelCost: influencer.negotiationCostData?.reelCost,
    negotiatedYoutubeVideoCost: influencer.negotiationCostData?.youtubeVideoCost,
    negotiatedYoutubeShortsCost: influencer.negotiationCostData?.youtubeShortsCoast,
    // followers: (influencer.instagramFollowers || influencer.youtubeFollowers || 0).toLocaleString(),
    category: influencer.category,
    cost: 'Negotiated',
    status: 'negotiated',
    _id: influencer._id
  }));

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleEditClick = (influencer) => {
    setSelectedInfluencer(influencer);
    setCostData({
      reelCost: '',
      youtubeShortsCoast: '',
      youtubeVideoCost: ''
    });
    setEditModalOpen(true);
  };

  const handleSaveCost = async () => {
    try {
      const { default: api } = await import('../services/api');
      await api.post('/negotiation-cost', {
        influencerId: selectedInfluencer._id,
        ...costData
      });
      setEditModalOpen(false);
      fetchPendingInfluencers();
      fetchCompletedInfluencers();
    } catch (error) {
      console.error('Failed to save negotiation cost:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setCostData(prev => ({ ...prev, [field]: value }));
  };

  const handleExportPending = async () => {
    try {
      const response = await exportNegotiationPending();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'pending_negotiations.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to export pending negotiations:', error);
    }
  };

  const handleExportCompleted = async () => {
    try {
      const response = await exportNegotiationCompleted();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'completed_negotiations.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to export completed negotiations:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" component="h1" sx={{ fontWeight: 600 }}>
          Negotiation Cost
        </Typography>
        <Button
          variant="contained"
          startIcon={<FileDownload />}
          onClick={activeTab === 0 ? handleExportPending : handleExportCompleted}
          sx={{ bgcolor: '#5386e4' }}
        >
          Export {activeTab === 0 ? 'Pending' : 'Completed'}
        </Button>
      </Box>

      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Pending" />
        <Tab label="Negotiated" />
      </Tabs>

      {activeTab === 0 && (
        <DataGrid
          columns={pendingColumns}
          rows={loading ? [] : pendingRows}
          loading={loading}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
          }}
          pageSizeOptions={[10, 20]}
          disableRowSelectionOnClick
          autoHeight
          className="table_border"
          sx={{
            boxShadow: 2,
            backgroundColor: 'white',
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#f8f9fa'
            },
            '& .MuiDataGrid-iconSeparator': {
              display: 'none'
            },
            '& .MuiDataGrid-row': {
              backgroundColor: 'white',
              borderLeft: 'solid 1px #e5e7eb',
              borderRight: 'solid 1px #e5e7eb'
            }
          }}
        />
      )}

      {activeTab === 1 && (
        <DataGrid
          columns={negotiatedColumns}
          rows={loading ? [] : negotiatedRows}
          loading={loading}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
          }}
          pageSizeOptions={[10, 20]}
          disableRowSelectionOnClick
          autoHeight
          className="table_border"
          sx={{
            boxShadow: 2,
            backgroundColor: 'white',
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#f8f9fa'
            },
            '& .MuiDataGrid-iconSeparator': {
              display: 'none'
            },
            '& .MuiDataGrid-row': {
              backgroundColor: 'white',
              borderLeft: 'solid 1px #e5e7eb',
              borderRight: 'solid 1px #e5e7eb'
            }
          }}
        />
      )}

      {/* Edit Cost Modal */}
      <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Negotiation Cost - {selectedInfluencer?.name}</DialogTitle>
        <DialogContent>
          {selectedInfluencer?.reelCost ? (
            <TextField
              fullWidth
              label="Reel Cost"
              type="number"
              value={costData.reelCost}
              onChange={(e) => handleInputChange('reelCost', e.target.value)}
              sx={{ mt: 2, mb: 2 }}
            />
          ) : null}
          {(selectedInfluencer?.youtubeShortsCost && selectedInfluencer?.youtubeVideoCost) ? (
            <>
              <TextField
                fullWidth
                label="YouTube Shorts Cost"
                type="number"
                value={costData.youtubeShortsCoast}
                onChange={(e) => handleInputChange('youtubeShortsCoast', e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="YouTube Video Cost"
                type="number"
                value={costData.youtubeVideoCost}
                onChange={(e) => handleInputChange('youtubeVideoCost', e.target.value)}
              />
            </>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditModalOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveCost} variant="contained" sx={{ bgcolor: '#5386e4' }}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default NegotiationCost;