import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    TextField,
    InputAdornment,
    Grid
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { ArrowBack } from '@mui/icons-material';
import { getCampaignApprovedInfluencers, updateInfluencerFinalCosts } from '../services/api';
import { toast } from 'react-toastify';

function InfluencerFinalCosts() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [influencers, setInfluencers] = useState([]);

    useEffect(() => {
        fetchApprovedInfluencers();
    }, []);

    const fetchApprovedInfluencers = async () => {
        setLoading(true);
        try {
            const response = await getCampaignApprovedInfluencers(id);
            const data = response.data.data || [];
            setInfluencers(data.map(inf => ({
                ...inf,
                finalCost: inf.finalCost || inf.reelCost || 0
            })));
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch approved influencers');
        } finally {
            setLoading(false);
        }
    };

    const handleCostChange = (influencerId, newValue) => {
        setInfluencers(prev => prev.map(inf =>
            inf._id === influencerId ? { ...inf, finalCost: newValue } : inf
        ));
    };

    const handleSave = async () => {
        try {
            const finalCosts = influencers.map(inf => ({
                influencerId: inf._id,
                finalCost: Number(inf.finalCost),
                stageStatus:8,
            }));
            
            await updateInfluencerFinalCosts(id, { finalCosts, status: 1 });
            toast.success('Final costs updated successfully');
            navigate(`/marketing/edit/${id}`);
        } catch (error) {
            console.error(error);
            toast.error('Failed to update final costs');
        }
    };

    const handleSaveDraft = async () => {
        try {
            const finalCosts = influencers.map(inf => ({
                influencerId: inf._id,
                finalCost: Number(inf.finalCost)
            }));
            
            await updateInfluencerFinalCosts(id, { finalCosts, status: 0 });
            toast.success('Draft saved successfully');
        } catch (error) {
            console.error(error);
            toast.error('Failed to save draft');
        }
    };

    const columns = [
        {
            field: 'sno',
            headerName: 'S.No',
            width: 70,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => {
                const index = influencers.findIndex(inf => inf._id === params.row._id);
                return (
                    <Typography variant="body2" fontWeight="medium">
                        {index + 1}
                    </Typography>
                );
            }
        },
        {
            field: 'name',
            headerName: 'Name',
            width: 250,
            renderCell: (params) => (
                <Typography variant="body2" fontWeight="medium">{params.value}</Typography>
            )
        },
        {
            field: 'reelCost',
            headerName: 'Initial Cost',
            width: 200,
            renderCell: (params) => (
                <Typography variant="body2" fontWeight="medium">
                    ₹{Number(params.value || 0).toLocaleString()}
                </Typography>
            )
        },
        {
            field: 'finalCost',
            headerName: 'Final Cost',
            width: 200,
            renderCell: (params) => (
                <TextField
                    size="small"
                    type="number"
                    value={params.value}
                    onChange={(e) => handleCostChange(params.row._id, e.target.value)}
                    InputProps={{
                        startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                    }}
                    sx={{
                        bgcolor: 'white',
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 1
                        }
                    }}
                />
            )
        }
    ];

    return (
        <Box sx={{ p: 4, bgcolor: '#f8fafc', minHeight: '100vh' }}>
            <Box sx={{ mb: 4 }}>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate(`/marketing/edit/${id}`)}
                    sx={{ mb: 2, color: 'text.secondary' }}
                >
                    Back
                </Button>
                <Typography variant="h5" fontWeight="bold" sx={{ color: '#1a1a1a' }}>
                    Final Cost Entry (IMT)
                </Typography>
            </Box>

            {/* <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={4}>
                    <Card sx={{ boxShadow: '0 2px 10px rgba(0,0,0,0.05)', borderRadius: 2 }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="body2" color="text.secondary">
                                Total Approved
                            </Typography>
                            <Typography variant="h4" fontWeight="bold" sx={{ color: '#1a1a1a' }}>
                                {influencers.length}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Card sx={{ boxShadow: '0 2px 10px rgba(0,0,0,0.05)', borderRadius: 2 }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="body2" color="text.secondary">
                                Initial Total
                            </Typography>
                            <Typography variant="h4" fontWeight="bold" sx={{ color: '#1a1a1a' }}>
                                ₹{influencers.reduce((total, inf) => total + Number(inf.reelCost || 0), 0).toLocaleString()}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Card sx={{ boxShadow: '0 2px 10px rgba(0,0,0,0.05)', borderRadius: 2 }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="body2" color="text.secondary">
                                Final Total
                            </Typography>
                            <Typography variant="h4" fontWeight="bold" sx={{ color: '#1a1a1a' }}>
                                ₹{influencers.reduce((total, inf) => total + Number(inf.finalCost || 0), 0).toLocaleString()}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid> */}

            <Card sx={{ boxShadow: '0 2px 10px rgba(0,0,0,0.05)', borderRadius: 2 }}>
                <CardContent sx={{ p: 0 }}>
                    <DataGrid
                        rows={influencers}
                        columns={columns}
                        getRowId={(row) => row._id}
                        autoHeight
                        disableSelectionOnClick
                        hideFooter
                        loading={loading}
                        sx={{
                            border: 'none',
                            '& .MuiDataGrid-columnHeaders': {
                                backgroundColor: '#f5f5f5',
                                color: '#666',
                                fontSize: '13px',
                                textTransform: 'uppercase',
                                borderBottom: 'none'
                            },
                            '& .MuiDataGrid-cell': {
                                borderBottom: '1px solid #f0f0f0',
                                py: 2
                            },
                            '& .MuiDataGrid-row:hover': {
                                backgroundColor: 'transparent'
                            }
                        }}
                    />
                </CardContent>
            </Card>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
                <Button
                    variant="outlined"
                    sx={{
                        color: '#666',
                        borderColor: '#ddd',
                        textTransform: 'none',
                        px: 3
                    }}
                    onClick={() => navigate(`/marketing/edit/${id}`)}
                >
                    Cancel
                </Button>
                {/* <Button
                    variant="outlined"
                    sx={{
                        color: '#2196f3',
                        borderColor: '#2196f3',
                        textTransform: 'none',
                        px: 3
                    }}
                    onClick={handleSaveDraft}
                >
                    Save as Draft
                </Button> */}
                <Button
                    variant="contained"
                    color="primary"
                    sx={{
                        textTransform: 'none',
                        px: 3,
                        bgcolor: '#2196f3'
                    }}
                    onClick={handleSave}
                >
                    Save Changes
                </Button>
            </Box>
        </Box>
    );
}

export default InfluencerFinalCosts;
