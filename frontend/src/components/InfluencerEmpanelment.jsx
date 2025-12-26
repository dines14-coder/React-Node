import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    Checkbox
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { ArrowBack, CloudUpload } from '@mui/icons-material';
import { getCampaignApprovedInfluencers, updateInfluencerEmpanelment } from '../services/api';
import { toast } from 'react-toastify';

function InfluencerEmpanelment() {
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
                nda: 0,
                guidelines: 0,
                verified: 0,
                fileName: ''
            })));
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch approved influencers');
        } finally {
            setLoading(false);
        }
    };

    const handleCheckboxChange = (influencerId, field, value) => {
        setInfluencers(prev => prev.map(inf =>
            inf._id === influencerId ? { ...inf, [field]: value ? 1 : 0 } : inf
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

    const handleSave = async () => {
        try {
            const empanelmentData = influencers.map(inf => ({
                influencerId: inf._id,
                ndaSigned: inf.nda,
                brandGuidelines: inf.guidelines,
                influencerDetails: inf.verified,
                ndaDocument: inf.fileName
            }));

            await updateInfluencerEmpanelment(id, { empanelmentData, stageStatus: 9 });
            navigate(`/marketing/edit/${id}`);
            toast.success('Empanelment data saved successfully');
        } catch (error) {
            console.error(error);
            toast.error('Failed to save empanelment data');
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
            field: 'nda',
            headerName: 'NDA Signed',
            width: 150,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <Checkbox
                    checked={params.value === 1}
                    onChange={(e) => handleCheckboxChange(params.row._id, 'nda', e.target.checked)}
                />
            )
        },
        {
            field: 'guidelines',
            headerName: 'Brand Guidelines Accepted',
            width: 200,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <Checkbox
                    checked={params.value === 1}
                    onChange={(e) => handleCheckboxChange(params.row._id, 'guidelines', e.target.checked)}
                />
            )
        },
        {
            field: 'verified',
            headerName: 'Influencer Details Verified',
            width: 200,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <Checkbox
                    checked={params.value === 1}
                    onChange={(e) => handleCheckboxChange(params.row._id, 'verified', e.target.checked)}
                />
            )
        },
        {
            field: 'upload',
            headerName: 'NDS Doc Upload',
            width: 150,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <>
                    <input
                        accept="*"
                        style={{ display: 'none' }}
                        id={`raised-button-file-${params.row._id}`}
                        type="file"
                        onChange={(e) => handleFileChange(e, params.row._id)}
                    />
                    <label htmlFor={`raised-button-file-${params.row._id}`}>
                        <Button
                            variant="contained"
                            component="span"
                            size="small"
                            startIcon={<CloudUpload />}
                            sx={{
                                bgcolor: '#2196f3',
                                textTransform: 'none',
                                maxWidth: '140px',
                                overflow: 'hidden',
                                whiteSpace: 'nowrap',
                                textOverflow: 'ellipsis'
                            }}
                            title={params.row.fileName || "Upload"}
                        >
                            {params.row.fileName ? (params.row.fileName.length > 10 ? params.row.fileName.substring(0, 10) + '...' : params.row.fileName) : "Upload"}
                        </Button>
                    </label>
                </>
            )
        },
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
                    Influencer Empanelment
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

export default InfluencerEmpanelment;
