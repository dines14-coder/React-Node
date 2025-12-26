import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, Button, TextField, MenuItem, Card, CardContent } from '@mui/material';
import { ArrowBack, CloudUpload } from '@mui/icons-material';
import { getBrands, getProducts, updateCampaignById } from '../services/api';
import { toast } from 'react-toastify';

function StageDetails() {
    const { id, stageId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const stageNameFromState = location.state?.stageName || '';
    const campaignTitleFromState = location.state?.campaignTitle || '';

    const [brands, setBrands] = useState([]);
    const [products, setProducts] = useState([]);
    const [formData, setFormData] = useState({
        brand: '',
        product: '',
        campaignTitle: campaignTitleFromState,
        description: '',
        campaignBrief: null
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchBrandsAndProducts();
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

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            const file = e.target.files[0];
            if (file.type !== 'application/pdf') {
                toast.error('Only PDF files are allowed');
                return;
            }
            setFormData({ ...formData, campaignBrief: file });
        }
    };

    const handleSubmit = async () => {
        const newErrors = {};
        if (!formData.brand) newErrors.brand = 'Brand is required';
        if (!formData.product) newErrors.product = 'Product is required';
        if (!formData.campaignBrief) newErrors.campaignBrief = 'Campaign Brief (PDF) is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        const submitData = new FormData();
        submitData.append('brand', formData.brand);
        submitData.append('product', formData.product);
        submitData.append('description', formData.description);
        submitData.append('stageStatus', 2);
        submitData.append('status', 1);
        if (formData.campaignBrief) {
            submitData.append('strategyDocument', formData.campaignBrief);
        }

        await updateCampaignById(id, submitData);
        setErrors({});
        navigate(`/marketing/edit/${id}`);
        toast.success('Submitted successfully');
    };

    return (
        <Box sx={{
            p: 3,
            minHeight: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            bgcolor: '#f5f5f5'
        }}>
            <Card sx={{ maxWidth: 600, width: '100%', boxShadow: 3 }}>
                <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h5" fontWeight="600">
                            Stage Details
                        </Typography>
                        <Button
                            startIcon={<ArrowBack />}
                            onClick={() => navigate(`/marketing/edit/${id}`)}
                        >
                            Back
                        </Button>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <TextField
                            select
                            label="Select Brand"
                            fullWidth
                            value={formData.brand}
                            onChange={(e) => {
                                setFormData({ ...formData, brand: e.target.value });
                                if (errors.brand) setErrors({ ...errors, brand: '' });
                            }}
                            error={!!errors.brand}
                            helperText={errors.brand}
                            required
                        >
                            {brands.map((brand) => (
                                <MenuItem key={brand._id} value={brand._id}>
                                    {brand.name}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            select
                            label="Select Product"
                            fullWidth
                            value={formData.product}
                            onChange={(e) => {
                                setFormData({ ...formData, product: e.target.value });
                                if (errors.product) setErrors({ ...errors, product: '' });
                            }}
                            error={!!errors.product}
                            helperText={errors.product}
                            required
                        >
                            {products.map((product) => (
                                <MenuItem key={product._id} value={product._id}>
                                    {product.name}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            label="Campaign Title"
                            fullWidth
                            value={formData.campaignTitle}
                            onChange={(e) => {
                                setFormData({ ...formData, campaignTitle: e.target.value });
                                if (errors.campaignTitle) setErrors({ ...errors, campaignTitle: '' });
                            }}
                            error={!!errors.campaignTitle}
                            helperText={errors.campaignTitle || "Showing Campaign Name"}
                            disabled
                        />

                        <Box sx={{
                            border: `1px dashed ${errors.fileUpload ? '#d32f2f' : '#ccc'}`,
                            borderRadius: 1,
                            p: 3,
                            textAlign: 'center',
                            bgcolor: '#fafafa',
                            cursor: 'pointer'
                        }}
                            onClick={() => document.getElementById('stage-file-input').click()}
                        >

                            <CloudUpload sx={{ fontSize: 40, color: errors.fileUpload ? '#d32f2f' : '#5386e4', mb: 1 }} />
                            <Typography color={errors.fileUpload ? 'error' : 'inherit'}>
                                {formData.fileUpload ? formData.fileUpload.name : 'Upload Campaign Brief (PDF) *'}
                            </Typography>
                            {errors.fileUpload && (
                                <Typography variant="caption" color="error" display="block">
                                    {errors.fileUpload}
                                </Typography>
                            )}
                            <input
                                id="stage-file-input"
                                type="file"
                                accept="application/pdf"
                                hidden
                                onChange={(e) => {
                                    handleFileChange(e);
                                    if (errors.fileUpload) setErrors({ ...errors, fileUpload: '' });
                                }}
                            />
                        </Box>

                        <TextField
                            label="Notes / Description"
                            multiline
                            rows={4}
                            fullWidth
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />

                        <Button
                            variant="contained"
                            fullWidth
                            size="large"
                            onClick={handleSubmit}
                            sx={{ mt: 2 }}
                        >
                            Save
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
}

export default StageDetails;
