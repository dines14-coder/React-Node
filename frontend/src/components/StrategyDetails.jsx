
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, Button, TextField, Card, CardContent, MenuItem } from '@mui/material';
import { CloudUpload, ArrowBack } from '@mui/icons-material';
import { getBrands, getProducts, getCampaignById, updateCampaignById } from '../services/api';
import { toast } from 'react-toastify';

function StrategyDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    // We can use these if passed from previous page for pre-filling
    const campaignTitleFromState = location.state?.campaignTitle || '';
    const [brands, setBrands] = useState([]);
    const [products, setProducts] = useState([]);

    const [formData, setFormData] = useState({
        brandName: '',
        productName: '',
        campaignName: campaignTitleFromState || 'Influencer Marketing Q3 2024 Campaign',
        notes: '',
        strategyDocument: null
    });

    useEffect(() => {
        fetchBrandsAndProducts();
        fetchCampaignData();
    }, []);

    const fetchBrandsAndProducts = async () => {
        try {
            const [brandsRes, productsRes] = await Promise.all([
                getBrands(),
                getProducts()
            ]);
            setBrands(brandsRes.data);
            setProducts(productsRes.data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch brands or products');
        }
    };

    const fetchCampaignData = async () => {
        try {
            const response = await getCampaignById(id);
            const campaign = response.data.data;
            setFormData(prev => ({
                ...prev,
                brandName: campaign.brand?.name || '',
                productName: campaign.product?.name || '',
                campaignName: campaign.campaignName || prev.campaignName
            }));
        } catch (error) {
            console.error(error);
        }
    };

    const [errors, setErrors] = useState({});

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            const file = e.target.files[0];
            const fileType = file.name.split('.').pop().toLowerCase();
            if (!['doc', 'pdf', 'docx'].includes(fileType)) {
                toast.error('Only .DOC, .DOCX, .PDF files are allowed');
                return;
            }
            setFormData({ ...formData, strategyDocument: file });
            if (errors.strategyDocument) setErrors({ ...errors, strategyDocument: '' });
        }
    };

    const handleSubmit = async () => {
        const newErrors = {};
        if (!formData.strategyDocument) newErrors.strategyDocument = 'Strategy Document is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        const submitData = new FormData();
        submitData.append('strategyDocument', formData.strategyDocument);
        submitData.append('stageTwoNotes', formData.notes);
        submitData.append('stageStatus', 3);

        await updateCampaignById(id, submitData);
        setErrors({});
        navigate(`/marketing/edit/${id}`);
        toast.success('Strategy submitted successfully!');
    };

    return (
        <Box sx={{
            p: 3,
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            bgcolor: '#f8fafc' // Light background
        }}>

            <Box sx={{ width: '100%', maxWidth: 800, mb: 4, display: 'flex', alignItems: 'center' }}>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate(`/marketing/edit/${id}`)}
                    sx={{ mr: 2, color: 'text.secondary' }}
                >
                    Back
                </Button>
                <Typography variant="h4" fontWeight="bold" sx={{ color: '#333', flexGrow: 1, textAlign: 'center', ml: -10 }}>
                    Upload Influencer Strategy
                </Typography>
            </Box>

            <Card sx={{ maxWidth: 800, width: '100%', boxShadow: '0px 4px 20px rgba(0,0,0,0.05)', borderRadius: 3 }}>
                <CardContent sx={{ p: 5 }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                        Strategy Details
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

                        <Box sx={{ display: 'flex', gap: 3 }}>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>Brand Name</Typography>
                                <TextField
                                    fullWidth
                                    // label="Brand Name"
                                    value={formData.brandName}
                                    disabled
                                    sx={{ bgcolor: 'white' }}
                                />
                            </Box>

                            <Box sx={{ flex: 1 }}>
                                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>Product Name</Typography>
                                <TextField
                                    fullWidth
                                    // label="Product Name"
                                    value={formData.productName}
                                    disabled
                                    sx={{ bgcolor: 'white' }}
                                />
                            </Box>
                        </Box>

                        <Box>
                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>Campaign Name</Typography>
                            <TextField
                                fullWidth
                                placeholder="Enter Campaign Name"
                                value={formData.campaignName}
                                onChange={(e) => setFormData({ ...formData, campaignName: e.target.value })}
                                error={!!errors.campaignName}
                                helperText={errors.campaignName}
                                sx={{ bgcolor: 'white' }}
                                disabled
                            />
                        </Box>

                        <Box>
                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>Strategy Document</Typography>
                            <Box
                                sx={{
                                    border: `1px dashed ${errors.file ? '#d32f2f' : '#cbd5e1'}`,
                                    borderRadius: 2,
                                    p: 3,
                                    textAlign: 'center',
                                    bgcolor: '#f1f5f9',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    '&:hover': {
                                        bgcolor: '#e2e8f0',
                                        borderColor: '#94a3b8'
                                    }
                                }}
                                onClick={() => document.getElementById('strategy-file-input').click()}
                            >
                                <CloudUpload sx={{ fontSize: 32, color: '#64748b', mb: 1 }} />
                                <Typography fontWeight="500" color="text.secondary">
                                    {formData.strategyDocument ? formData.strategyDocument.name : 'Upload Strategy Document'}
                                </Typography>
                                <input
                                    id="strategy-file-input"
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    hidden
                                    onChange={handleFileChange}
                                />
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                <Typography variant="caption" sx={{ bgcolor: '#e2e8f0', px: 1, py: 0.5, borderRadius: 1, color: '#475569' }}>
                                    Accepted: .DOC, .PDF
                                </Typography>
                            </Box>
                            {errors.strategyDocument && (
                                <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                                    {errors.file}
                                </Typography>
                            )}
                        </Box>

                        <Box>
                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>Optional Notes</Typography>
                            <TextField
                                fullWidth
                                multiline
                                rows={4}
                                placeholder="Add any relevant notes or context for the approvers..."
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                sx={{ bgcolor: 'white' }}
                            />
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                            <Button
                                variant="text"
                                sx={{ mr: 2, color: 'text.secondary' }}
                                onClick={() => navigate(`/marketing/edit/${id}`)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                size="large"
                                onClick={handleSubmit}
                                sx={{
                                    bgcolor: '#1E90FF',
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    px: 4
                                }}
                            >
                                Submit for Approval
                            </Button>
                        </Box>

                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
}

export default StrategyDetails;
