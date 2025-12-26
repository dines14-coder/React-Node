import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    Switch,
    TextField
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { ArrowBack } from '@mui/icons-material';
import { getCampaignApprovedInfluencers, updateBudgetRelease } from '../services/api';
import { toast } from 'react-toastify';

function BudgetRelease() {
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
            const currentDate = new Date().toISOString().split('T')[0];
            setInfluencers(data.map(inf => ({
                ...inf,
                released: false,
                date: currentDate
            })));
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch approved influencers');
        } finally {
            setLoading(false);
        }
    };

    const handleSwitchChange = (influencerId, value) => {
        setInfluencers(prev => prev.map(inf =>
            inf._id === influencerId ? { ...inf, released: value } : inf
        ));
        // toast.info(value ? 'Budget marked as released' : 'Budget marked as not released');
    };

    const handleDateChange = (influencerId, value) => {
        setInfluencers(prev => prev.map(inf =>
            inf._id === influencerId ? { ...inf, date: value } : inf
        ));
    };

    const handleSave = async () => {
        try {
            const budgetData = influencers.map(inf => ({
                influencerId: inf._id,
                cost: inf.finalCost || 0,
                budgetRelease: inf.released ? 1 : 0,
                releaseDate: inf.date
            }));
            
            await updateBudgetRelease(id, { budgetData, stageStatus: 10 });
            toast.success('Budget release data saved successfully');
            navigate(`/marketing/edit/${id}`);
        } catch (error) {
            console.error(error);
            toast.error('Failed to save budget release data');
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
            headerName: 'Influencer Name',
            width: 250,
            renderCell: (params) => (
                <Typography variant="body2" fontWeight="medium">{params.value}</Typography>
            )
        },
        {
            field: 'finalCost',
            headerName: 'Cost',
            width: 150,
            renderCell: (params) => (
                <Typography variant="body2" color="text.secondary">
                    ₹{Number(params.value || 0).toLocaleString()}
                </Typography>
            )
        },
        {
            field: 'released',
            headerName: 'Budget Released',
            width: 200,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <Switch
                    checked={params.value}
                    onChange={(e) => handleSwitchChange(params.row._id, e.target.checked)}
                    color="primary"
                />
            )
        },
        {
            field: 'date',
            headerName: 'Released Date',
            width: 250,
            renderCell: (params) => (
                <TextField
                    type="date"
                    size="small"
                    fullWidth
                    value={params.value}
                    onChange={(e) => handleDateChange(params.row._id, e.target.value)}
                    InputLabelProps={{
                        shrink: true,
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
                    Budget Release
                </Typography>
            </Box>

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
                                backgroundColor: '#f8f9fa',
                                color: '#666',
                                fontSize: '13px',
                                textTransform: 'uppercase',
                                borderBottom: '1px solid #e0e0e0',
                                fontWeight: 600
                            },
                            '& .MuiDataGrid-cell': {
                                borderBottom: '1px solid #f0f0f0',
                                py: 2
                            },
                            '& .MuiDataGrid-row:hover': {
                                backgroundColor: '#fafafa'
                            }
                        }}
                    />
                </CardContent>
            </Card>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
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

export default BudgetRelease;
