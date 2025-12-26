import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Grid,
    Chip,
    IconButton,
    Card,
    CardContent,
    Tabs,
    Tab
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Add, Edit, Delete, Visibility, CloudUpload, Close, CheckCircle, Restore } from '@mui/icons-material';
import { toast } from 'react-toastify';
import {
    getAllMarketing,
    getAllCampaign,
    createMarketing,
    updateMarketing,
    deleteMarketing,
    updateMarketingStatus,
    createCampaign
} from '../services/api';

function Marketing() {
    const navigate = useNavigate();
    const [marketingData, setMarketingData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        campaignName: ''
    });

    const [dragOver, setDragOver] = useState(false);
    const [tabValue, setTabValue] = useState(0);
    const [fileViewDialog, setFileViewDialog] = useState(false);
    const [viewingFile, setViewingFile] = useState(null);

    const fetchMarketingData = async () => {
        setLoading(true);
        try {
            const response = await getAllCampaign();
            console.log('Fetched marketing data:', response.data.data);
            setMarketingData(response.data?.data || []);
        } catch (error) {
            console.error('Failed to fetch marketing data:', error);
            toast.error('Failed to fetch marketing data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMarketingData();
    }, []);

    const handleOpenDialog = (marketing = null) => {
        if (marketing) {
            setEditingId(marketing._id);
            setFormData({
                campaignName: marketing.campaignName || ''
            });
        } else {
            setEditingId(null);
            setFormData({
                campaignName: ''
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingId(null);
        setFormData({
            campaignName: ''
        });
        setDragOver(false);
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        validateAndSetFile(file);
    };

    const validateAndSetFile = (selectedFile) => {
        if (selectedFile) {
            setFormData(prev => ({ ...prev, fileUpload: selectedFile }));
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const droppedFile = e.dataTransfer.files[0];
        validateAndSetFile(droppedFile);
    };

    // const handleSubmit = async () => {
    //   try {
    //     const submitData = new FormData();
    //     Object.keys(formData).forEach(key => {
    //       if (key === 'fileUpload' && formData[key]) {
    //         submitData.append('fileUpload', formData[key]);
    //       } else if (key !== 'fileUpload' && formData[key]) {
    //         submitData.append(key, formData[key]);
    //       }
    //     });

    //     if (editingId) {
    //       await updateMarketing(editingId, submitData);
    //       toast.success('Marketing entry updated successfully');
    //     } else {
    //       await createMarketing(submitData);
    //       toast.success('Marketing entry created successfully');
    //     }

    //     handleCloseDialog();
    //     fetchMarketingData();
    //   } catch (error) {
    //     console.error('Failed to save marketing entry:', error);
    //     toast.error('Failed to save marketing entry');
    //   }
    // };


    const handleSubmit = async () => {
        try {
            const data = {
                name: formData.campaignName,
                status: 1
            }
            await createCampaign(data);
            handleCloseDialog();
            fetchMarketingData();
            toast.success('Campaign created successfully');
        } catch (err) {
            toast.error('Failed to save marketing entry');
        }
    }


    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this marketing entry?')) {
            try {
                await deleteMarketing(id);
                toast.success('Marketing entry deleted successfully');
                fetchMarketingData();
            } catch (error) {
                console.error('Failed to delete marketing entry:', error);
                toast.error('Failed to delete marketing entry');
            }
        }
    };

    const getFileExtension = (filename) => {
        return filename.split('.').pop().toLowerCase();
    };

    const isImageFile = (filename) => {
        const imageExtensions = ['jpg', 'jpeg', 'png', 'webp'];
        return imageExtensions.includes(getFileExtension(filename));
    };

    const isPdfFile = (filename) => {
        return getFileExtension(filename) === 'pdf';
    };

    const handleViewFile = (filename) => {
        if (!filename) return;

        const fileUrl = `http://localhost:5000/api/marketing/file/${filename}`;

        if (isPdfFile(filename)) {
            // Open PDF in new tab
            window.open(fileUrl, '_blank');
        } else if (isImageFile(filename)) {
            // Show image in iframe dialog
            setViewingFile({ filename, url: fileUrl, type: 'image' });
            setFileViewDialog(true);
        } else {
            // For other file types, open in new tab
            window.open(fileUrl, '_blank');
        }
    };

    const handleCloseFileView = () => {
        setFileViewDialog(false);
        setViewingFile(null);
    };



    const handleStatusChange = async (id, newStatus) => {
        try {
            await updateMarketingStatus(id, newStatus);
            toast.success(`Marketing status updated to ${newStatus === 0 ? 'Completed' : 'Pending'}`);
            fetchMarketingData();
        } catch (error) {
            console.error('Failed to update status:', error);
            toast.error('Failed to update status');
        }
    };

    const columns = [
        { field: 'sno', headerName: 'S.No', width: 80 },
        { field: 'campaignName', headerName: 'Campaign Name', width: 250 },
        {
            field: 'status',
            headerName: 'Status',
            width: 200,
            renderCell: (params) => (
                <Chip
                    label={params.value != 2 ? 'Pending' : 'Completed'}
                    color={params.value != 2 ? 'warning' : 'success'}
                    size="small"
                />
            )
        },
        {
            field: 'createdAt',
            headerName: 'Created At',
            width: 200,
            valueFormatter: (params) => {
                if (!params.value) return '-';
                return new Date(params.value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
            }
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 200,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                        size="small"
                        onClick={() => navigate(`/marketing/edit/${params.row.id}`)}
                        sx={{ color: '#5386e4' }}
                        title="Edit"
                    >
                        <Edit />
                    </IconButton>
                </Box>
            )
        }
    ];

    const rows = marketingData.map((item, index) => ({
        id: item._id,
        sno: index + 1,
        campaignName: item.campaignName || '-',
        status: item.status,
        createdAt: item.createdAt,
        allData: item
    }));

    const pendingRows = rows.filter(row => row.status != 2);
    const completedRows = rows.filter(row => row.status == 2);

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" component="h1" sx={{ fontWeight: 600 }}>
                    Campaign Collection
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => handleOpenDialog()}
                    sx={{ bgcolor: '#5386e4' }}
                >
                    Add Campaign
                </Button>
            </Box>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
                    <Tab label="Pending" />
                    <Tab label="Completed" />
                </Tabs>
            </Box>

            {tabValue === 0 && (
                <DataGrid
                    columns={columns}
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
                    sx={{
                        boxShadow: 2,
                        backgroundColor: 'white',
                        '& .MuiDataGrid-columnHeaders': {
                            backgroundColor: '#f8f9fa'
                        }
                    }}
                />
            )}

            {tabValue === 1 && (
                <DataGrid
                    columns={columns}
                    rows={loading ? [] : completedRows}
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
            )}

            {/* Add/Edit Marketing Dialog */}
            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {editingId ? 'Edit Campaign Entry' : 'Add Campaign Entry'}
                    <IconButton onClick={handleCloseDialog}>
                        <Close />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Campaign Title"
                                value={formData.campaignName}
                                onChange={(e) => handleInputChange('campaignName', e.target.value)}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        sx={{ bgcolor: '#5386e4' }}
                    >
                        {editingId ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* File View Dialog for Images */}
            <Dialog
                open={fileViewDialog}
                onClose={handleCloseFileView}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    File Preview: {viewingFile?.filename}
                    <IconButton onClick={handleCloseFileView}>
                        <Close />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ p: 0 }}>
                    {viewingFile && viewingFile.type === 'image' && (
                        <Box sx={{ width: '100%', height: '500px' }}>
                            <iframe
                                src={viewingFile.url}
                                width="100%"
                                height="100%"
                                style={{ border: 'none' }}
                                title="File Preview"
                            />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseFileView}>Close</Button>
                    <Button
                        variant="contained"
                        onClick={() => window.open(viewingFile?.url, '_blank')}
                        sx={{ bgcolor: '#5386e4' }}
                    >
                        Open in New Tab
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default Marketing;