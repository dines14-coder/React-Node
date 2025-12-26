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
import { getCampaignApprovedInfluencers, updateContentCoordination } from '../services/api';
import { toast } from 'react-toastify';

function ContentCoordination() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [rows, setRows] = useState([]);

    useEffect(() => {
        fetchApprovedInfluencers();
    }, []);

    const fetchApprovedInfluencers = async () => {
        setLoading(true);
        try {
            const response = await getCampaignApprovedInfluencers(id);
            const data = response.data.data || [];
            setRows(data.map(inf => ({
                ...inf,
                id: inf._id,
                approved: false,
                whatsapp: ''
            })));
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch approved influencers');
        } finally {
            setLoading(false);
        }
    };

    const handleSwitchChange = (id, value) => {
        setRows(prevRows => prevRows.map(row =>
            row.id === id ? { ...row, approved: value } : row
        ));
    };

    const handleInputChange = (id, value) => {
        setRows(prevRows => prevRows.map(row =>
            row.id === id ? { ...row, whatsapp: value } : row
        ));
    };

    const handleSubmit = async () => {
        try {
            const contentData = rows.map(row => ({
                influencerId: row._id,
                contentApproved: row.approved ? 1 : 0,
                whatsappLink: row.whatsapp || ''
            }));

            await updateContentCoordination(id, { contentData, stageStatus: 13 });
            toast.success('Content coordination details updated');
            navigate(`/marketing/edit/${id}`);
        } catch (error) {
            console.error(error);
            toast.error('Failed to update content coordination');
        }
    };

    const columns = [
        {
            field: 'id',
            headerName: 'S.No',
            width: 70,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => {
                const index = rows.findIndex(row => row._id === params.row._id);
                return index + 1;
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
            field: 'approved',
            headerName: 'Content Approved',
            width: 200,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <Switch
                    checked={params.value}
                    onChange={(e) => handleSwitchChange(params.id, e.target.checked)}
                    color="primary"
                />
            )
        },
        {
            field: 'whatsapp',
            headerName: 'Whatsapp Group Links',
            width: 350,
            renderCell: (params) => (
                <TextField
                    size="small"
                    fullWidth
                    placeholder='Enter link...'
                    value={params.value}
                    onChange={(e) => handleInputChange(params.id, e.target.value)}
                    sx={{
                        bgcolor: 'white',
                        '& .MuiOutlinedInput-root': { borderRadius: 1 }
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
                    Content Coordination & Script Development
                </Typography>
            </Box>

            <Card sx={{ boxShadow: '0 2px 10px rgba(0,0,0,0.05)', borderRadius: 2 }}>
                <CardContent sx={{ p: 0 }}>
                    <DataGrid
                        rows={rows}
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
                    onClick={handleSubmit}
                    sx={{ px: 4, py: 1 }}
                >
                    Submit
                </Button>
            </Box>
        </Box>
    );
}

export default ContentCoordination;
