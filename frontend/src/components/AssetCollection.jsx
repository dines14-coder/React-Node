import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { ArrowBack, CloudUpload } from '@mui/icons-material';
import { getCampaignApprovedInfluencers, updateAssetCollection } from '../services/api';
import { toast } from 'react-toastify';

function AssetCollection() {
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
                fileName: ''
            })));
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch approved influencers');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (event, rowId) => {
        const file = event.target.files[0];
        if (file) {
            console.log(`File uploaded for ID ${rowId}:`, file.name);
            setRows(prevRows => prevRows.map(row =>
                row._id === rowId ? { ...row, fileName: file.name, file: file } : row
            ));
            // toast.success(`File "${file.name}" uploaded`);
        }
    };

    const handleSubmit = async () => {
        try {
            const assetData = rows.map(row => ({
                influencerId: row._id,
                assetCollectionFile: row.fileName || null
            }));

            await updateAssetCollection(id, { assetData, stageStatus: 16 });
            toast.success('Assets submitted successfully');
            navigate(`/marketing/edit/${id}`);
        } catch (error) {
            console.error(error);
            toast.error('Failed to submit assets');
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
                const index = rows.findIndex(row => row._id === params.row._id);
                return index + 1;
            }
        },
        {
            field: 'name',
            headerName: 'Influencer Name',
            flex: 1,
            renderCell: (params) => (
                <Typography variant="body2" fontWeight="medium">{params.value}</Typography>
            )
        },
        {
            field: 'action',
            headerName: 'Asset Collection',
            width: 200,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <>
                    <input
                        accept="*"
                        style={{ display: 'none' }}
                        id={`asset-upload-file-${params.row._id}`}
                        type="file"
                        onChange={(e) => handleFileChange(e, params.row._id)}
                    />
                    <label htmlFor={`asset-upload-file-${params.row._id}`}>
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
                    Asset Collection
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

export default AssetCollection;
