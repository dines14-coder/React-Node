import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    Switch
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { ArrowBack, CloudUpload } from '@mui/icons-material';
import { getCampaignApprovedInfluencers, updatePODispatch } from '../services/api';
import { toast } from 'react-toastify';

function PODispatch() {
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
                sent: false,
                fileName: ''
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
            inf._id === influencerId ? { ...inf, sent: value } : inf
        ));
    };

    const handleFileChange = (event, influencerId) => {
        const file = event.target.files[0];
        if (file) {
            setInfluencers(prev => prev.map(inf =>
                inf._id === influencerId ? { ...inf, fileName: file.name, file: file } : inf
            ));
        }
    };

    const handleSubmit = async () => {
        try {
            const poData = influencers.map(inf => ({
                influencerId: inf._id,
                uploadPO: inf.fileName,
                sentToInfluencer: inf.sent ? 1 : 0
            }));

            await updatePODispatch(id, { poData, stageStatus: 11 });
            toast.success('PO Dispatch details submitted successfully');
            navigate(`/marketing/edit/${id}`);
        } catch (error) {
            console.error(error);
            toast.error('Failed to submit PO dispatch details');
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
            width: 300,
            renderCell: (params) => (
                <Typography variant="body2" fontWeight="medium">{params.value}</Typography>
            )
        },
        {
            field: 'upload',
            headerName: 'Upload PO',
            width: 200,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <>
                    <input
                        accept="*"
                        style={{ display: 'none' }}
                        id={`po-upload-file-${params.row._id}`}
                        type="file"
                        onChange={(e) => handleFileChange(e, params.row._id)}
                    />
                    <label htmlFor={`po-upload-file-${params.row._id}`}>
                        <Button
                            variant="contained"
                            component="span"
                            size="small"
                            startIcon={<CloudUpload />}
                            sx={{
                                bgcolor: '#2196f3',
                                textTransform: 'none',
                                maxWidth: '180px',
                                overflow: 'hidden',
                                whiteSpace: 'nowrap',
                                textOverflow: 'ellipsis'
                            }}
                            title={params.row.fileName || "Upload"}
                        >
                            {params.row.fileName ? (params.row.fileName.length > 12 ? params.row.fileName.substring(0, 12) + '...' : params.row.fileName) : "Upload"}
                        </Button>
                    </label>
                </>
            )
        },
        {
            field: 'sent',
            headerName: 'Sent to Influencers',
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
                    PO Dispatch
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
                    onClick={handleSubmit}
                    sx={{ px: 4, py: 1 }}
                >
                    Submit
                </Button>
            </Box>
        </Box>
    );
}

export default PODispatch;
