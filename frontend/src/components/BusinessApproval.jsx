import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    IconButton,
    Grid
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { ArrowBack, CheckCircle, RadioButtonUnchecked, People, Visibility } from '@mui/icons-material';
import { getCampaignShortlistedInfluencers, updateCampaignById } from '../services/api';
import { toast } from 'react-toastify';

function BusinessApproval() {
    const { id, stageId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [influencers, setInfluencers] = useState([]);
    const [approvedIds, setApprovedIds] = useState([]);

    useEffect(() => {
        fetchShortlistedInfluencers();
    }, []);

    const fetchShortlistedInfluencers = async () => {
        setLoading(true);
        try {
            const response = await getCampaignShortlistedInfluencers(id);
            setInfluencers(response.data.data || []);
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch shortlisted influencers');
        } finally {
            setLoading(false);
        }
    };

    const handleApprovalToggle = (id) => {
        setApprovedIds(prev => {
            if (prev.includes(id)) {
                return prev.filter(item => item !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    const handleSubmit = async () => {
        try {
            const data = {
                influencerApproveList: approvedIds,
                stageStatus: 7
            };
            await updateCampaignById(id, data);
            toast.success(`Successfully approved ${approvedIds.length} influencers`);
            navigate(`/marketing/edit/${id}`);
        } catch (error) {
            console.error(error);
            toast.error('Failed to submit approval');
        }
    };

    const columns = [
        {
            field: 'sno',
            headerName: 'SNO',
            width: 80,
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
            headerName: 'Influencer Name',
            width: 300,
            renderCell: (params) => (
                <Typography variant="body2" fontWeight="medium">{params.value}</Typography>
            )
        },
        {
            field: 'reach',
            headerName: 'Reach',
            width: 150,
            renderCell: (params) => {
                const totalReach = params.row?.last10ReelsReach;
                if (!totalReach || isNaN(totalReach)) return "-";
                const average = Number(totalReach) / 10;
                return (
                    <Typography variant="body2" color="text.secondary">
                        {average}
                    </Typography>
                );
            }
        },
        {
            field: 'cost',
            headerName: 'Cost',
            width: 150,
            renderCell: (params) => {
                const totalCost = params.row?.reelCost || 0;
                return (
                    <Typography variant="body2" fontWeight="medium">
                        ₹{Number(totalCost).toLocaleString()}
                    </Typography>
                );
            }
        },
        {
            field: 'approval',
            headerName: 'Approval',
            width: 100,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => {
                const isApproved = approvedIds.includes(params.row._id);
                return (
                    <IconButton onClick={() => handleApprovalToggle(params.row._id)}>
                        {isApproved ?
                            <CheckCircle sx={{ color: '#2196f3', fontSize: 28 }} /> :
                            <RadioButtonUnchecked sx={{ color: '#e0e0e0', fontSize: 28 }} />
                        }
                    </IconButton>
                );
            }
        },
    ];

    return (
        <Box sx={{ p: 4, bgcolor: '#f8fafc', minHeight: '100vh' }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate(`/marketing/edit/${id}`)}
                    sx={{ mb: 2, color: 'text.secondary' }}
                >
                    Back
                </Button>
                <Typography variant="h5" fontWeight="bold" sx={{ color: '#1a1a1a' }}>
                    Business Approval
                </Typography>
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={4}>
                    <Card sx={{ boxShadow: '0 2px 10px rgba(0,0,0,0.05)', borderRadius: 2 }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="body2" color="text.secondary">
                                Total Influencers
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
                                Total Reach
                            </Typography>
                            <Typography variant="h4" fontWeight="bold" sx={{ color: '#1a1a1a' }}>
                                {influencers.reduce((total, inf) => {
                                    const reach = inf.last10ReelsReach;
                                    return total + (reach && !isNaN(reach) ? Number(reach) / 10 : 0);
                                }, 0).toLocaleString()}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Card sx={{ boxShadow: '0 2px 10px rgba(0,0,0,0.05)', borderRadius: 2 }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="body2" color="text.secondary">
                                Total Cost
                            </Typography>
                            <Typography variant="h4" fontWeight="bold" sx={{ color: '#1a1a1a' }}>
                                ₹{influencers.reduce((total, inf) => {
                                    const cost = inf.reelCost || 0;
                                    return total + Number(cost);
                                }, 0).toLocaleString()}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Card sx={{ boxShadow: '0 2px 10px rgba(0,0,0,0.05)', borderRadius: 2 }}>
                <CardContent sx={{ p: 0 }}>
                    <DataGrid
                        rows={influencers}
                        columns={columns}
                        getRowId={(row) => row._id}
                        autoHeight
                        disableSelectionOnClick
                        hideFooter
                        sx={{
                            border: 'none',
                            '& .MuiDataGrid-columnHeaders': {
                                backgroundColor: '#fff',
                                borderBottom: '1px solid #f0f0f0',
                                color: '#666',
                                fontSize: '13px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            },
                            '& .MuiDataGrid-cell': {
                                borderBottom: '1px solid #f5f5f5',
                                paddingTop: '16px',
                                paddingBottom: '16px'
                            },
                            '& .MuiDataGrid-row:hover': {
                                backgroundColor: '#fafafa'
                            }
                        }}
                    />
                </CardContent>
            </Card>

            {/* Footer Actions */}
            <Box sx={{ mt: 4 }}>
                <Box sx={{
                    bgcolor: '#f8f9fa',
                    p: 2,
                    borderRadius: 1,
                    mb: 3,
                    display: 'flex',
                    alignItems: 'center'
                }}>
                    <Typography variant="subtitle1" fontWeight="medium" color="text.secondary">
                        Approved Influencers:
                    </Typography>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ ml: 1 }}>
                        {approvedIds.length}
                    </Typography>
                </Box>

                <Button
                    variant="contained"
                    size="large"
                    onClick={handleSubmit}
                    sx={{
                        bgcolor: '#2196f3',
                        color: 'white',
                        py: 1.0,
                        textTransform: 'none',
                        fontSize: '16px',
                        fontWeight: 500,
                        '&:hover': {
                            bgcolor: '#1976d2'
                        },
                        boxShadow: 'none'
                    }}
                >
                    Submit Approval
                </Button>
            </Box>
        </Box>
    );
}

export default BusinessApproval;
