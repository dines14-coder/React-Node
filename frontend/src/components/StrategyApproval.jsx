
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, Button, TextField, Card, CardContent, Chip, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { CloudDownload, Check, Close, ArrowBack } from '@mui/icons-material';
import { getCampaignById, updateCampaignById } from '../services/api';
import { toast } from 'react-toastify';

function StrategyApproval() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const campaignTitleFromState = location.state?.campaignTitle || '';

    const [data, setData] = useState({
        brandName: '',
        productName: '',
        campaignName: '',
        documentName: ''
    });
    const [rejectModal, setRejectModal] = useState(false);
    const [remarks, setRemarks] = useState('');

    useEffect(() => {
        fetchCampaignData();
    }, []);

    const fetchCampaignData = async () => {
        try {
            const response = await getCampaignById(id);
            const campaign = response.data.data;
            setData({
                brandName: campaign.brand?.name || '',
                productName: campaign.product?.name || '',
                campaignName: campaign.campaignName || '',
                documentName: campaign.strategyDocument || 'No document uploaded'
            });
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch campaign data');
        }
    };

    const handleApprove = async () => {
        const submitData = new FormData();
        submitData.append('strategyApproveStatus', 'approved');
        submitData.append('stageStatus', 4);

        await updateCampaignById(id, submitData);
        navigate(`/marketing/edit/${id}`);
        toast.success('Strategy Approved Successfully!');
        // logic to update status
        // navigate(`/marketing/edit/${id}`);
    };

    const handleReject = () => {
        setRejectModal(true);
    };

    const handleRejectSubmit = async () => {
        if (!remarks.trim()) {
            toast.error('Remarks are required');
            return;
        }
        // console.log('Rejection remarks:', remarks);

        const submitData = new FormData();
        submitData.append('strategyApproveStatus', 'rejected');
        submitData.append('strategyRejectedRemaks', remarks);
        submitData.append('stageStatus', 3);
        await updateCampaignById(id, submitData);
        navigate(`/marketing/edit/${id}`);
        toast.error('Strategy Rejected');
        setRejectModal(false);
        setRemarks('');
    };

    const handleViewDocument = () => {
        if (data.documentName && data.documentName !== 'No document uploaded') {
            const fileUrl = `${process.env.REACT_APP_NODE_BASE_URL}/uploads/${data.documentName}`;
            window.open(fileUrl, '_blank');
        } else {
            toast.error('No document available to view');
        }
    };

    return (
        <Box sx={{
            p: 3,
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            bgcolor: '#f8fafc',
            position: 'relative'
        }}>

            <Box sx={{
                width: '100%',
                maxWidth: 800,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 4
            }}>
                {/* Back Button */}
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate(`/marketing/edit/${id}`)}
                    sx={{ color: 'text.secondary', mr: 2 }}
                >
                    Back
                </Button>

                <Typography variant="h5" fontWeight="bold" sx={{ color: '#333', textAlign: 'center', flexGrow: 1 }}>
                    Strategy Approval
                </Typography>

                <Chip
                    label="Pending Approval"
                    sx={{
                        bgcolor: '#f1f5f9',
                        color: '#64748b',
                        fontWeight: 600,
                        borderRadius: 2
                    }}
                />
            </Box>

            <Card sx={{ maxWidth: 800, width: '100%', boxShadow: '0px 4px 20px rgba(0,0,0,0.05)', borderRadius: 3 }}>
                <CardContent sx={{ p: 5 }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 4 }}>
                        Strategy
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

                        <Box sx={{ display: 'flex', gap: 3 }}>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500, color: '#666' }}>Brand Name</Typography>
                                <TextField
                                    fullWidth
                                    value={data.brandName}
                                    disabled
                                    sx={{ bgcolor: 'white' }}
                                />
                            </Box>

                            <Box sx={{ flex: 1 }}>
                                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500, color: '#666' }}>Product Name</Typography>
                                <TextField
                                    fullWidth
                                    value={data.productName}
                                    disabled
                                    sx={{ bgcolor: 'white' }}
                                />
                            </Box>
                        </Box>

                        <Box>
                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500, color: '#666' }}>Campaign Name</Typography>
                            <TextField
                                fullWidth
                                value={data.campaignName}
                                disabled
                                sx={{ bgcolor: 'white' }}
                            />
                        </Box>

                        <Box>
                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500, color: '#666' }}>Strategy Document</Typography>
                            <Box
                                onClick={handleViewDocument}
                                sx={{
                                    border: '1px solid #e2e8f0',
                                    borderRadius: 1,
                                    p: 2,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 1,
                                    bgcolor: '#f8fafc',
                                    cursor: 'pointer',
                                    '&:hover': {
                                        bgcolor: '#f1f5f9'
                                    }
                                }}
                            >
                                <CloudDownload sx={{ color: '#64748b' }} />
                                <Typography fontWeight="500" color="text.secondary">
                                    {data.documentName}
                                </Typography>
                            </Box>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                            <Button
                                variant="contained"
                                startIcon={<Check />}
                                onClick={handleApprove}
                                sx={{
                                    bgcolor: '#2196f3',
                                    '&:hover': { bgcolor: '#1976d2' },
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    px: 3,
                                    py: 1
                                }}
                            >
                                Approve Strategy
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<Close />}
                                onClick={handleReject}
                                sx={{
                                    bgcolor: '#ef4444',
                                    '&:hover': { bgcolor: '#dc2626' },
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    px: 3,
                                    py: 1
                                }}
                            >
                                Reject Strategy
                            </Button>
                        </Box>

                    </Box>
                </CardContent>
            </Card>

            {/* Reject Modal */}
            <Dialog open={rejectModal} onClose={() => setRejectModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Reject Strategy</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Remarks"
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        placeholder="Please provide reason for rejection..."
                        sx={{ mt: 2 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRejectModal(false)}>Cancel</Button>
                    <Button variant="contained" color="error" onClick={handleRejectSubmit}>
                        Reject
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default StrategyApproval;
