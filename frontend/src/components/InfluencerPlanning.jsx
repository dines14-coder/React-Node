
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Box,
    Button,
    Typography,
    TextField,
    MenuItem,
    Grid,
    Chip,
    Card,
    CardContent,
    IconButton
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { FilterList, Close, FileDownload, ArrowBack } from '@mui/icons-material';
import { getInfluencers, exportFilteredInfluencers, updateCampaignById } from '../services/api';
import { toast } from 'react-toastify';

function InfluencerPlanning() {
    const { id, stageId } = useParams();
    const navigate = useNavigate();
    const [influencers, setInfluencers] = useState([]);
    const [filteredInfluencers, setFilteredInfluencers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        state: '',
        city: '',
        category: '',
        platformType: '',
        socialMediaPlatforms: '',
        influencerType: '',
        engagementRateInstagram: '',
        engagementRateYoutube: '',
        averageViewInstagram: '',
        averageViewYoutube: ''
    });
    const [uniqueValues, setUniqueValues] = useState({
        states: [],
        cities: [],
        categories: [],
        platformTypes: [],
        socialMediaPlatforms: [],
        engagementRatesInstagram: [],
        engagementRatesYoutube: [],
        averageViewsInstagram: [],
        averageViewsYoutube: []
    });
    const [showFilters, setShowFilters] = useState(false);
    const [selectionModel, setSelectionModel] = useState([]);

    useEffect(() => {
        fetchInfluencers();
    }, []);

    useEffect(() => {
        if (influencers.length > 0) {
            extractUniqueValues();
        }
        applyFilters();
    }, [influencers, filters]);

    const extractUniqueValues = () => {
        if (!Array.isArray(influencers) || influencers.length === 0) return;

        const tableData = influencers.filter(i => i.negotiation_status === 1);

        const states = [...new Set(tableData.map(i => i.state).filter(Boolean))];
        const cities = [...new Set(tableData.map(i => i.city).filter(Boolean))];
        const categories = [...new Set(tableData.map(i => i.category).filter(Boolean))];

        const engagementRatesInstagram = [...new Set(tableData.map(i => {
            const rate = calculateEngagementRate(i, 'instagram');
            return rate > 0 ? Math.floor(rate * 10) / 10 : null;
        }).filter(Boolean))].sort((a, b) => a - b);

        const engagementRatesYoutube = [...new Set(tableData.map(i => {
            const rate = calculateEngagementRate(i, 'youtube');
            return rate > 0 ? Math.floor(rate * 10) / 10 : null;
        }).filter(Boolean))].sort((a, b) => a - b);

        const averageViewsInstagram = [...new Set(tableData.map(i => {
            const views = calculateAverageViews(i, 'instagram');
            return views > 0 ? Math.floor(views) : null;
        }).filter(Boolean))].sort((a, b) => a - b);

        const averageViewsYoutube = [...new Set(tableData.map(i => {
            const views = calculateAverageViews(i, 'youtube');
            return views > 0 ? Math.floor(views) : null;
        }).filter(Boolean))].sort((a, b) => a - b);


        setUniqueValues({
            states,
            cities,
            categories,
            engagementRatesInstagram,
            engagementRatesYoutube,
            averageViewsInstagram,
            averageViewsYoutube
        });
    };

    const fetchInfluencers = async () => {
        setLoading(true);
        try {
            const response = await getInfluencers();
            setInfluencers(response.data || response);
        } catch (error) {
            console.error('Failed to fetch influencers:', error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        if (!Array.isArray(influencers)) {
            setFilteredInfluencers([]);
            return;
        }

        let filtered = influencers.filter(influencer => {
            if (influencer.negotiation_status !== 1) return false;

            const matchesState = !filters.state || influencer.state === filters.state;
            const matchesCity = !filters.city || influencer.city === filters.city;
            const matchesCategory = !filters.category || influencer.category === filters.category;

            const matchesSocialMediaPlatforms = !filters.socialMediaPlatforms ||
                (filters.socialMediaPlatforms === 'Intagram' && influencer.socialMediaPlatforms?.toLowerCase().includes('instagram')) ||
                (filters.socialMediaPlatforms === 'Youtube' && influencer.socialMediaPlatforms?.toLowerCase().includes('youtube'));

            const matchesInfluencerType = !filters.influencerType ||
                influencer.instagramInfluencerType === filters.influencerType ||
                influencer.youtubeInfluencerType === filters.influencerType;

            const instagramEngagement = calculateEngagementRate(influencer, 'instagram');
            const youtubeEngagement = calculateEngagementRate(influencer, 'youtube');
            const instagramViews = calculateAverageViews(influencer, 'instagram');
            const youtubeViews = calculateAverageViews(influencer, 'youtube');

            const matchesInstagramEngagement = !filters.engagementRateInstagram || instagramEngagement >= Number(filters.engagementRateInstagram);
            const matchesYoutubeEngagement = !filters.engagementRateYoutube || youtubeEngagement >= Number(filters.engagementRateYoutube);
            const matchesInstagramViews = !filters.averageViewInstagram || instagramViews >= Number(filters.averageViewInstagram);
            const matchesYoutubeViews = !filters.averageViewYoutube || youtubeViews >= Number(filters.averageViewYoutube);

            return matchesState && matchesCity && matchesCategory && matchesSocialMediaPlatforms && matchesInfluencerType &&
                matchesInstagramEngagement && matchesYoutubeEngagement && matchesInstagramViews && matchesYoutubeViews;
        });
        setFilteredInfluencers(filtered);
    };

    const calculateEngagementRate = (influencer, platform) => {
        if (platform === 'instagram') {
            const likes = Number(influencer.instagramLikes) || 0;
            const comments = Number(influencer.instagramComments) || 0;
            const saves = Number(influencer.instagramSaves) || 0;
            const shares = Number(influencer.instagramShares) || 0;
            const reposts = Number(influencer.instagramReposts) || 0;
            const totalReach = Number(influencer.last10ReelsReach);
            if (!totalReach || isNaN(totalReach)) return 0;
            const avgReach = totalReach / 10;
            return avgReach === 0 ? 0 : ((likes + comments + saves + shares + reposts) / avgReach) * 100;
        } else {
            const likes = Number(influencer.youtubeLikes) || 0;
            const comments = Number(influencer.youtubeComments) || 0;
            const saves = Number(influencer.youtubeSaves) || 0;
            const shares = Number(influencer.youtubeShares) || 0;
            const totalReach = Number(influencer.last10ShortsReach);
            if (!totalReach || isNaN(totalReach)) return 0;
            const avgReach = totalReach / 10;
            return avgReach === 0 ? 0 : ((likes + comments + saves + shares) / avgReach) * 100;
        }
    };

    const calculateAverageViews = (influencer, platform) => {
        if (platform === 'instagram') {
            const totalViews = Number(influencer.last10ReelsViews);
            return totalViews && !isNaN(totalViews) ? totalViews / 10 : 0;
        } else {
            const totalViews = Number(influencer.last10ShortsViews);
            return totalViews && !isNaN(totalViews) ? totalViews / 10 : 0;
        }
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    const exportToExcel = async () => {
        try {
            const response = await exportFilteredInfluencers(filters);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'influencer_planning_data.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Failed to export filtered data:', error);
        }
    };

    const handleShortlist = async () => {
        console.log('Shortlisting selected influencers:', selectionModel);
        // TODO: Implement shortlist API call
        if (selectionModel.length > 0) {
            const data = {
                influencerList: selectionModel,
                stageStatus: 5
            }
            await updateCampaignById(id, data);
            navigate(`/marketing/edit/${id}`);
            toast.success('Submited Successfully!');
        }
    };

    const columns = [
        { field: 'sno', headerName: 'SNO', width: 80 },
        { field: 'name', headerName: 'Name', width: 150 },
        { field: 'state', headerName: 'State', width: 150 },
        { field: 'city', headerName: 'City', width: 150 },
        { field: 'category', headerName: 'Category', width: 150 },
        { field: 'socialMediaPlatforms', headerName: 'Platform Type', width: 180 },
        {
            field: 'instagramInfluencerType',
            headerName: 'Instagram Type',
            width: 180,
            renderCell: (params) => {
                const type = params.row.allData?.instagramInfluencerType;
                if (!type || type === '-') return '-';
                const getColor = (type) => {
                    switch (type) {
                        case 'Micro': return 'primary';
                        case 'Macro': return 'secondary';
                        case 'Mid-tier': return 'success';
                        case 'Mega': return 'warning';
                        case 'Celeb': return 'error';
                        default: return 'default';
                    }
                };
                return <Chip label={type} color={getColor(type)} size="small" />;
            }
        },
        {
            field: 'youtubeInfluencerType',
            headerName: 'YouTube Type',
            width: 180,
            renderCell: (params) => {
                const type = params.row.allData?.youtubeInfluencerType;
                if (!type || type === '-') return '-';
                const getColor = (type) => {
                    switch (type) {
                        case 'Micro': return 'primary';
                        case 'Macro': return 'secondary';
                        case 'Mid-tier': return 'success';
                        case 'Mega': return 'warning';
                        case 'Celeb': return 'error';
                        default: return 'default';
                    }
                };
                return <Chip label={type} color={getColor(type)} size="small" />;
            }
        },
        {
            field: 'totalCostInstagram',
            headerName: 'Total Cost (Instagram)',
            width: 180,
            cellClassName: 'instagram-cell',
            renderCell: (params) => {
                const reelCost = params.row.allData?.reelCost || 0;
                const storyCost = params.row.allData?.storyCost || 0;
                const total = reelCost + storyCost;
                return total > 0 ? `₹${total.toLocaleString()}` : '-';
            }
        },
        {
            field: 'negotiationCostInstagram',
            headerName: 'Negotiation Total Cost (Instagram)',
            width: 220,
            cellClassName: 'instagram-cell',
            renderCell: (params) => {
                const negotiationCost = params.row.allData?.negotiationCost?.reelCost || 0;
                return negotiationCost > 0 ? `₹${negotiationCost.toLocaleString()}` : '-';
            }
        },
        {
            field: 'engagementRateInstagram',
            headerName: 'Engagement Rate (Instagram)',
            width: 200,
            cellClassName: 'instagram-cell',
            renderCell: (params) => {
                const rate = calculateEngagementRate(params.row.allData, 'instagram');
                return rate > 0 ? Number(rate.toFixed(2)) : '-';
            }
        },
        {
            field: 'averageViewInstagram',
            headerName: 'Average View (Instagram)',
            width: 180,
            cellClassName: 'instagram-cell',
            renderCell: (params) => {
                const views = calculateAverageViews(params.row.allData, 'instagram');
                return views > 0 ? views.toLocaleString() : '-';
            }
        },
        {
            field: 'totalCostYoutube',
            headerName: 'Total Cost (YouTube)',
            width: 180,
            cellClassName: 'youtube-cell',
            renderCell: (params) => {
                const videoCost = params.row.allData?.youtubeVideoCost || 0;
                const shortsCost = params.row.allData?.youtubeShortsCost || 0;
                const total = videoCost + shortsCost;
                return total > 0 ? `₹${total.toLocaleString()}` : '-';
            }
        },
        {
            field: 'negotiationCostYoutube',
            headerName: 'Negotiation Total Cost (Youtube)',
            width: 220,
            cellClassName: 'youtube-cell',
            renderCell: (params) => {
                const videoCost = params.row.allData?.negotiationCost?.youtubeVideoCost || 0;
                const shortsCost = params.row.allData?.negotiationCost?.youtubeShortsCoast || 0;
                const total = videoCost + shortsCost;
                return total > 0 ? `₹${total.toLocaleString()}` : '-';
            }
        },
        {
            field: 'engagementRateYoutube',
            headerName: 'Engagement Rate (Youtube)',
            width: 200,
            cellClassName: 'youtube-cell',
            renderCell: (params) => {
                const rate = calculateEngagementRate(params.row.allData, 'youtube');
                return rate > 0 ? Number(rate.toFixed(2)) : '-';
            }
        },
        {
            field: 'averageViewYoutube',
            headerName: 'Average View (Youtube)',
            width: 180,
            cellClassName: 'youtube-cell',
            renderCell: (params) => {
                const views = calculateAverageViews(params.row.allData, 'youtube');
                return views > 0 ? views.toLocaleString() : '-';
            }
        }
    ];

    const rows = filteredInfluencers.map((influencer, index) => ({
        id: influencer._id,
        sno: index + 1,
        name: influencer.name,
        state: influencer.state,
        city: influencer.city,
        category: influencer.category,
        socialMediaPlatforms: influencer.socialMediaPlatforms,
        instagramInfluencerType: influencer.instagramInfluencerType,
        _id: influencer._id,
        allData: influencer
    }));


    return (
        <Box sx={{ p: 3, bgcolor: '#f8fafc', minHeight: '100vh' }}>

            {/* Header with Back Button */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate(`/marketing/edit/${id}`)}
                    sx={{ mr: 2, color: 'text.secondary' }}
                >
                    Back
                </Button>
                <Typography variant="h5" fontWeight="bold" sx={{ color: '#333' }}>
                    Influencer Planning
                </Typography>
            </Box>

            {/* Filters Button */}
            {!showFilters && (
                <Box sx={{ mb: 3 }}>
                    <Button
                        variant="outlined"
                        startIcon={<FilterList />}
                        onClick={() => setShowFilters(true)}
                        sx={{ color: '#5386e4', borderColor: '#5386e4' }}
                    >
                        FILTERS
                    </Button>
                </Box>
            )}

            {/* Filters Panel */}
            {showFilters && (
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="h6">Filters</Typography>
                            <IconButton onClick={() => setShowFilters(false)} sx={{ color: '#5386e4' }}>
                                <Close />
                            </IconButton>
                        </Box>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6} md={3}>
                                <TextField
                                    fullWidth
                                    select
                                    label="State"
                                    value={filters.state}
                                    onChange={(e) => handleFilterChange('state', e.target.value)}
                                    size="small"
                                >
                                    <MenuItem value="">All</MenuItem>
                                    {uniqueValues.states.map(state => (
                                        <MenuItem key={state} value={state}>{state}</MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <TextField
                                    fullWidth
                                    select
                                    label="City"
                                    value={filters.city}
                                    onChange={(e) => handleFilterChange('city', e.target.value)}
                                    size="small"
                                >
                                    <MenuItem value="">All</MenuItem>
                                    {uniqueValues.cities.map(city => (
                                        <MenuItem key={city} value={city}>{city}</MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Category"
                                    value={filters.category}
                                    onChange={(e) => handleFilterChange('category', e.target.value)}
                                    size="small"
                                >
                                    <MenuItem value="">All</MenuItem>
                                    {uniqueValues.categories.map(category => (
                                        <MenuItem key={category} value={category}>{category}</MenuItem>
                                    ))}
                                </TextField>
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
                                    <MenuItem value="Intagram">Instagram</MenuItem>
                                    <MenuItem value="Youtube">Youtube</MenuItem>
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Influencer Type"
                                    value={filters.influencerType}
                                    onChange={(e) => handleFilterChange('influencerType', e.target.value)}
                                    size="small"
                                >
                                    <MenuItem value="">All</MenuItem>
                                    <MenuItem value="Micro">Micro</MenuItem>
                                    <MenuItem value="Macro">Macro</MenuItem>
                                    <MenuItem value="Mid-tier">Mid-tier</MenuItem>
                                    <MenuItem value="Mega">Mega</MenuItem>
                                    <MenuItem value="Celeb">Celeb</MenuItem>
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Engagement Rate (Instagram)"
                                    value={filters.engagementRateInstagram}
                                    onChange={(e) => handleFilterChange('engagementRateInstagram', e.target.value)}
                                    size="small"
                                >
                                    <MenuItem value="">All</MenuItem>
                                    {uniqueValues.engagementRatesInstagram.map(rate => (
                                        <MenuItem key={rate} value={rate}>{rate}%+</MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Engagement Rate (Youtube)"
                                    value={filters.engagementRateYoutube}
                                    onChange={(e) => handleFilterChange('engagementRateYoutube', e.target.value)}
                                    size="small"
                                >
                                    <MenuItem value="">All</MenuItem>
                                    {uniqueValues.engagementRatesYoutube.map(rate => (
                                        <MenuItem key={rate} value={rate}>{rate}%+</MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Average View (Instagram)"
                                    value={filters.averageViewInstagram}
                                    onChange={(e) => handleFilterChange('averageViewInstagram', e.target.value)}
                                    size="small"
                                >
                                    <MenuItem value="">All</MenuItem>
                                    {uniqueValues.averageViewsInstagram.map(views => (
                                        <MenuItem key={views} value={views}>{views.toLocaleString()}+</MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Average View (Youtube)"
                                    value={filters.averageViewYoutube}
                                    onChange={(e) => handleFilterChange('averageViewYoutube', e.target.value)}
                                    size="small"
                                >
                                    <MenuItem value="">All</MenuItem>
                                    {uniqueValues.averageViewsYoutube.map(views => (
                                        <MenuItem key={views} value={views}>{views.toLocaleString()}+</MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            )}

            {/* Table Card */}
            <Card>
                <CardContent>

                    <DataGrid
                        columns={columns}
                        rows={loading ? [] : rows}
                        loading={loading}
                        checkboxSelection
                        onSelectionModelChange={(newSelection) => {
                            console.log('Selected IDs:', newSelection);
                            setSelectionModel(newSelection);
                        }}
                        selectionModel={selectionModel}
                        initialState={{
                            pagination: {
                                paginationModel: { page: 0, pageSize: 10 },
                            },
                        }}
                        pageSizeOptions={[10, 20, 50, 100]}
                        disableRowSelectionOnClick
                        autoHeight
                        sx={{
                            '& .MuiDataGrid-columnHeaders': {
                                backgroundColor: '#f8f9fa'
                            },
                            '& .instagram-cell': {
                                backgroundColor: '#e8f4fcb7 !important'
                            },
                            '& .youtube-cell': {
                                backgroundColor: '#fff5e69a !important'
                            }
                        }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleShortlist}
                            disabled={selectionModel.length === 0}
                        >
                            Shortlist
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
}

export default InfluencerPlanning;
