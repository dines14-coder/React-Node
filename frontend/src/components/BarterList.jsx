import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Alert,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    TextField,
    Button,
    IconButton
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Visibility, FileDownload, FilterList, Close, PictureAsPdf } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { getBarterInfluencers } from '../services/api';
import { generateInfluencerPDF } from '../utils/pdfGenerator';

function BarterList() {
    const navigate = useNavigate();
    const [barterInfluencers, setBarterInfluencers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState({ show: false, message: '', severity: 'success' });
    const [filters, setFilters] = useState({
        state: '',
        city: '',
        category: '',
        platformType: '',
        socialMediaPlatforms: '',
        influencerType: ''
    });
    const [showFilters, setShowFilters] = useState(false);

    const columns = [
        { field: 'sno', headerName: 'S.No', width: 80 },
        { field: 'name', headerName: 'Name', width: 150 },
        { field: 'email', headerName: 'Email', width: 200 },
        { field: 'contactNumber', headerName: 'Contact', width: 130 },
        { field: 'state', headerName: 'State', width: 120 },
        { field: 'city', headerName: 'City', width: 120 },
        { field: 'category', headerName: 'Category', width: 120 },
        { field: 'instagramInfluencerType', headerName: 'IG Type', width: 100 },
        { field: 'youtubeInfluencerType', headerName: 'YT Type', width: 100 },
        { field: 'platformType', headerName: 'Platform Type', width: 120 },
        { field: 'instagramLink', headerName: 'Instagram', width: 200 },
        { field: 'youtubeLink', headerName: 'YouTube', width: 200 },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 150,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                        size="small"
                        onClick={() => navigate(`/influencer/${params.row._id}`)}
                        sx={{ color: '#5386e4' }}
                    >
                        <Visibility />
                    </IconButton>
                    <IconButton
                        size="small"
                        onClick={() => generatePDF(params.row)}
                        sx={{ color: '#d32f2f' }}
                    >
                        <PictureAsPdf />
                    </IconButton>
                </Box>
            )
        }
    ];

    useEffect(() => {
        fetchBarterInfluencers();
    }, []);

    const fetchBarterInfluencers = async () => {
        setLoading(true);
        try {
            const response = await getBarterInfluencers();
            setBarterInfluencers(response.data?.data || []);
        } catch (error) {
            console.error('Fetch error:', error);
            showAlert('Failed to fetch barter influencers', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showAlert = (message, severity) => {
        setAlert({ show: true, message, severity });
        setTimeout(() => setAlert({ show: false, message: '', severity: 'success' }), 3000);
    };

    const generatePDF = (influencer) => {
        generateInfluencerPDF(influencer, 'barter_details');
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    const getFilteredRows = () => {
        let filtered = barterInfluencers;

        if (filters.state) {
            filtered = filtered.filter(inf => inf.state === filters.state);
        }
        if (filters.city) {
            filtered = filtered.filter(inf => inf.city === filters.city);
        }
        if (filters.category) {
            filtered = filtered.filter(inf => inf.category === filters.category);
        }
        if (filters.platformType) {
            filtered = filtered.filter(inf => inf.platformType === filters.platformType);
        }
        if (filters.socialMediaPlatforms) {
            if (filters.socialMediaPlatforms === 'Barter') {
                filtered = filtered.filter(inf => inf.platformType === 'Barter');
            } else {
                filtered = filtered.filter(inf =>
                    inf.socialMediaPlatforms &&
                    inf.socialMediaPlatforms.includes(filters.socialMediaPlatforms)
                );
            }
        }
        if (filters.influencerType) {
            filtered = filtered.filter(inf =>
                inf.instagramInfluencerType === filters.influencerType ||
                inf.youtubeInfluencerType === filters.influencerType
            );
        }

        return filtered.map((inf, index) => ({
            ...inf,
            id: inf._id,
            _id: inf._id,
            sno: index + 1,
            instagramLink: inf.instagramLink || '-',
            youtubeLink: inf.youtubeLink || '-',
            state: inf.state || '-',
            city: inf.city || '-',
            instagramInfluencerType: inf.instagramInfluencerType || '-',
            youtubeInfluencerType: inf.youtubeInfluencerType || '-'
        }));
    };

    const getUniqueValues = (field) => {
        return [...new Set(barterInfluencers.map(inf => inf[field]).filter(Boolean))];
    };

    const exportToExcel = () => {
        const filteredData = getFilteredRows();
        const exportData = filteredData.map(row => ({
            'S.No': row.sno,
            'Name': row.name,
            'Email': row.email,
            'Date of Birth': row.dateOfBirth || '-',
            'Age': row.age || '-',
            'Gender': row.gender || '-',
            'Language': row.language || '-',
            'Category': row.category || '-',
            'Brand Collaboration': row.brandCollaboration || '-',
            'Contact Number': row.contactNumber || '-',
            'Address': row.address || '-',
            'Pincode': row.pincode || '-',
            'State': row.state,
            'City': row.city,
            'Location': row.location || '-',
            'Platform Type': row.platformType || '-',
            'Social Media Platforms': Array.isArray(row.socialMediaPlatforms) ? row.socialMediaPlatforms.join(', ') : (row.socialMediaPlatforms || '-'),
            'Instagram Link': row.instagramLink,
            'YouTube Link': row.youtubeLink,
            'Instagram Followers': row.instagramFollowers || '-',
            'Instagram Type': row.instagramInfluencerType,
            'Instagram Likes': row.instagramLikes || '-',
            'Instagram Comments': row.instagramComments || '-',
            'Instagram Saves': row.instagramSaves || '-',
            'Instagram Shares': row.instagramShares || '-',
            'Instagram Reposts': row.instagramReposts || '-',
            'Last 10 Reels Views': row.last10ReelsViews || '-',
            'Last 10 Reels Reach': row.last10ReelsReach || '-',
            'Reel Cost': row.reelCost || '-',
            'Story Cost': row.storyCost || '-',
            'YouTube Followers': row.youtubeFollowers || '-',
            'YouTube Type': row.youtubeInfluencerType,
            'YouTube Likes': row.youtubeLikes || '-',
            'YouTube Comments': row.youtubeComments || '-',
            'YouTube Saves': row.youtubeSaves || '-',
            'YouTube Shares': row.youtubeShares || '-',
            'Last 10 Shorts Views': row.last10ShortsViews || '-',
            'Last 10 Shorts Reach': row.last10ShortsReach || '-',
            'YouTube Video Cost': row.youtubeVideoCost || '-',
            'YouTube Shorts Cost': row.youtubeShortsCost || '-',
            'PAN Number': row.panNumber || '-',
            'Bank Account Number': row.bankAccountNumber || '-',
            'IFSC Code': row.ifscCode || '-',
            'Account Holder Name': row.holderName || '-',
            'Bank Name': row.bankName || '-',
            'Delivery Address Same': row.deliveryAddressSame || '-',
            'Delivery Address': row.deliveryAddress || '-',
            'Remarks': row.remarks || '-',
            'Status': row.status || '-',
            'Created At': row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '-',
            'Updated At': row.updatedAt ? new Date(row.updatedAt).toLocaleDateString() : '-'
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Barter Influencers');
        XLSX.writeFile(wb, `barter-influencers-${new Date().toISOString().split('T')[0]}.xlsx`);
        showAlert('Excel file exported successfully', 'success');
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Barter Influencers
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="outlined"
                        startIcon={<FilterList />}
                        onClick={() => setShowFilters(!showFilters)}
                        sx={{ color: '#5386e4', borderColor: '#5386e4' }}
                    >
                        Filters
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<FileDownload />}
                        onClick={exportToExcel}
                        sx={{ bgcolor: '#5386e4' }}
                    >
                        Export Excel
                    </Button>
                </Box>
            </Box>

            {alert.show && (
                <Alert severity={alert.severity} sx={{ mb: 2 }}>
                    {alert.message}
                </Alert>
            )}

            {showFilters && (
                <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">Filters</Typography>
                        <IconButton 
                            onClick={() => setShowFilters(false)}
                            sx={{ color: '#5386e4' }}
                        >
                            <Close />
                        </IconButton>
                    </Box>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth size="small">
                                <InputLabel>State</InputLabel>
                                <Select
                                    value={filters.state}
                                    label="State"
                                    onChange={(e) => handleFilterChange('state', e.target.value)}
                                >
                                    <MenuItem value="">All States</MenuItem>
                                    {getUniqueValues('state').map(state => (
                                        <MenuItem key={state} value={state}>{state}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth size="small">
                                <InputLabel>City</InputLabel>
                                <Select
                                    value={filters.city}
                                    label="City"
                                    onChange={(e) => handleFilterChange('city', e.target.value)}
                                >
                                    <MenuItem value="">All Cities</MenuItem>
                                    {getUniqueValues('city').map(city => (
                                        <MenuItem key={city} value={city}>{city}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Category</InputLabel>
                                <Select
                                    value={filters.category}
                                    label="Category"
                                    onChange={(e) => handleFilterChange('category', e.target.value)}
                                >
                                    <MenuItem value="">All Categories</MenuItem>
                                    {getUniqueValues('category').map(category => (
                                        <MenuItem key={category} value={category}>{category}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                select
                                label="Platform Type"
                                value={filters.socialMediaPlatforms}
                                onChange={(e) => handleFilterChange('socialMediaPlatforms', e.target.value)}
                                size="small"
                            >
                                <MenuItem value="">All</MenuItem>
                                <MenuItem value="instagram">Instagram</MenuItem>
                                <MenuItem value="youtube">Youtube</MenuItem>
                                <MenuItem value="Barter">Barter</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Influencer Type</InputLabel>
                                <Select
                                    value={filters.influencerType}
                                    label="Influencer Type"
                                    onChange={(e) => handleFilterChange('influencerType', e.target.value)}
                                >
                                    <MenuItem value="">All</MenuItem>
                                    <MenuItem value="Micro">Micro: 10K-100K</MenuItem>
                                    <MenuItem value="Macro">Macro: 100K-500K</MenuItem>
                                    <MenuItem value="Mid-tier">Mid-tier: 500K-1M</MenuItem>
                                    <MenuItem value="Mega">Mega: 1M-5M</MenuItem>
                                    <MenuItem value="Celeb">Celeb: 5M+</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </CardContent>
                </Card>
            )}

            <Card>
                <CardContent>
                    <DataGrid
                        rows={getFilteredRows()}
                        columns={columns}
                        pageSize={10}
                        loading={loading}
                        autoHeight
                        getRowId={(row) => row.id}
                    />
                </CardContent>
            </Card>
        </Box>
    );
}

export default BarterList;