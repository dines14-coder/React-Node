import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  IconButton,
  Collapse
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Visibility, FileDownload, FilterList, Clear, Close, PictureAsPdf } from '@mui/icons-material';
import ReactApexChart from 'react-apexcharts';
import { getInfluencers, getNegotiationCompleted, exportInfluencers, exportFilteredInfluencers } from '../services/api';
import { generateInfluencerPDF } from '../utils/pdfGenerator';

function Dashboard() {
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
  const [genderData, setGenderData] = useState({ series: [], options: {} });
  const [ageData, setAgeData] = useState({ series: [], options: {} });
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

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

    // Filter data to only include negotiation_status = 1 for dropdown options
    const tableData = influencers.filter(i => i.negotiation_status === 1);

    const states = [...new Set(tableData.map(i => i.state).filter(Boolean))];
    const cities = [...new Set(tableData.map(i => i.city).filter(Boolean))];
    const categories = [...new Set(tableData.map(i => i.category).filter(Boolean))];
    const platformTypes = [...new Set(tableData.map(i => i.platformType).filter(Boolean))];
    const socialMediaPlatforms = [...new Set(tableData.map(i => i.socialMediaPlatforms).filter(Boolean))];

    // Get actual engagement rates from table data
    const engagementRatesInstagram = [...new Set(tableData.map(i => {
      const rate = calculateEngagementRate(i, 'instagram');
      return rate > 0 ? Math.floor(rate * 10) / 10 : null;
    }).filter(Boolean))].sort((a, b) => a - b);

    const engagementRatesYoutube = [...new Set(tableData.map(i => {
      const rate = calculateEngagementRate(i, 'youtube');
      return rate > 0 ? Math.floor(rate * 10) / 10 : null;
    }).filter(Boolean))].sort((a, b) => a - b);

    // Get actual average views from table data
    const averageViewsInstagram = [...new Set(tableData.map(i => {
      const views = calculateAverageViews(i, 'instagram');
      return views > 0 ? Math.floor(views) : null;
    }).filter(Boolean))].sort((a, b) => a - b);

    const averageViewsYoutube = [...new Set(tableData.map(i => {
      const views = calculateAverageViews(i, 'youtube');
      return views > 0 ? Math.floor(views) : null;
    }).filter(Boolean))].sort((a, b) => a - b);

    console.log('Average Views Instagram:', averageViewsInstagram);
    console.log('Average Views YouTube:', averageViewsYoutube);

    setUniqueValues({
      states,
      cities,
      categories,
      platformTypes,
      socialMediaPlatforms,
      engagementRatesInstagram,
      engagementRatesYoutube,
      averageViewsInstagram,
      averageViewsYoutube
    });

    // Gender Distribution - only from table data
    const genderCounts = tableData.reduce((acc, inf) => {
      const gender = inf.gender || 'Unknown';
      acc[gender] = (acc[gender] || 0) + 1;
      return acc;
    }, {});

    const genderSeries = Object.values(genderCounts);
    const genderOptions = {
      labels: Object.keys(genderCounts),
      colors: ['#5386e4', '#69dc9c', '#f6b042'],
      legend: { position: 'bottom' }
    };

    setGenderData({ series: genderSeries, options: genderOptions });

    // Age Distribution - only from table data
    const ageRanges = {
      '05-17': 0,
      '18-25': 0,
      '26-35': 0,
      '36-45': 0,
      '46+': 0
    };

    tableData.forEach(inf => {
      const age = inf.age;
      if (age >= 5 && age <= 17) ageRanges['05-17']++;
      else if (age >= 18 && age <= 25) ageRanges['18-25']++;
      else if (age >= 26 && age <= 35) ageRanges['26-35']++;
      else if (age >= 36 && age <= 45) ageRanges['36-45']++;
      else if (age >= 46) ageRanges['46+']++;
    });

    const ageSeries = [{
      name: 'Count',
      data: Object.values(ageRanges)
    }];

    const ageOptions = {
      chart: { type: 'bar' },
      xaxis: { categories: Object.keys(ageRanges) },
      colors: ['#5386e4']
    };

    setAgeData({ series: ageSeries, options: ageOptions });
  };

  const fetchInfluencers = async () => {
    setLoading(true);
    try {
      const response = await getInfluencers();
      console.log('API Response:', response);
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
      // Only show influencers with negotiation_status = 1
      if (influencer.negotiation_status !== 1) return false;

      const matchesState = !filters.state || influencer.state === filters.state;
      const matchesCity = !filters.city || influencer.city === filters.city;
      const matchesCategory = !filters.category || influencer.category === filters.category;
      const matchesPlatformType = !filters.platformType || influencer.platformType === filters.platformType;
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

      return matchesState && matchesCity && matchesCategory && matchesPlatformType &&
        matchesSocialMediaPlatforms && matchesInfluencerType && matchesInstagramEngagement && matchesYoutubeEngagement &&
        matchesInstagramViews && matchesYoutubeViews;
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

  const clearAllFilters = () => {
    setFilters({
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
  };

  const columns = [
    { field: 'sno', headerName: 'SNO', width: 80 },
    { field: 'name', headerName: 'Name', width: 150 },
    { field: 'state', headerName: 'State', width: 150 },
    { field: 'city', headerName: 'City', width: 150 },
    { field: 'category', headerName: 'Category', width: 150 },
    // { field: 'platformType', headerName: 'Platform Type', width: 130 },
    { field: 'socialMediaPlatforms', headerName: 'Platform Type', width: 180 },
    {
      field: 'instagramInfluencerType',
      headerName: 'Instagram Type',
      width: 180,
      // cellClassName: 'instagram-cell',
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
      // cellClassName: 'youtube-cell',
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
    },
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
            onClick={() => generatePDF(params.row.allData)}
            sx={{ color: '#d32f2f' }}
          >
            <PictureAsPdf />
          </IconButton>
        </Box>
      )
    }
  ];

  const rows = filteredInfluencers.map((influencer, index) => ({
    id: influencer._id,
    sno: index + 1,
    name: influencer.name,
    state: influencer.state,
    city: influencer.city,
    category: influencer.category,
    platformType: influencer.platformType,
    socialMediaPlatforms: influencer.socialMediaPlatforms,
    _id: influencer._id,
    allData: influencer
  }));

  const generatePDF = (influencer) => {
    generateInfluencerPDF(influencer, 'details');
  };

  const exportToExcel = async () => {
    try {
      const response = await exportFilteredInfluencers(filters);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'filtered_dashboard_data.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to export filtered data:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" component="h1" sx={{ fontWeight: 600 }}>
          Dashboard Overview
        </Typography>

      </Box>

      {!showFilters ? (
        <Box sx={{ mb: 3 }}>
          <Button
            variant="outlined"
            startIcon={<FilterList />}
            onClick={() => setShowFilters(true)}
            sx={{ color: '#5386e4', borderColor: '#5386e4' }}
          >
            Filters
          </Button>
        </Box>
      ) : (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Filters</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {/* <Button
                  startIcon={<Clear />}
                  onClick={clearAllFilters}
                  size="small"
                  sx={{ color: '#5386e4' }}
                >
                  Clear All
                </Button> */}
                <IconButton
                  onClick={() => setShowFilters(false)}
                  sx={{ color: '#5386e4' }}
                >
                  <Close />
                </IconButton>
              </Box>
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
                  <MenuItem value="Micro">Micro: 10K-100K</MenuItem>
                  <MenuItem value="Macro">Macro: 100K-500K</MenuItem>
                  <MenuItem value="Mid-tier">Mid-tier: 500K-1M</MenuItem>
                  <MenuItem value="Mega">Mega: 1M-5M</MenuItem>
                  <MenuItem value="Celeb">Celeb: 5M+</MenuItem>
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

      <Card>
        <CardContent>
          <Button
            variant="contained"
            startIcon={<FileDownload />}
            onClick={exportToExcel}
            sx={{ bgcolor: '#5386e4', mb: 2 }}
          >
            Export Excel
          </Button>
          <DataGrid
            columns={columns}
            rows={loading ? [] : rows}
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
        </CardContent>
      </Card>

      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12} md={4.8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Gender Distribution</Typography>
              <ReactApexChart
                options={genderData.options}
                series={genderData.series}
                type="pie"
                width="100%"
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={7.2}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Age Distribution</Typography>
              <ReactApexChart
                options={ageData.options}
                series={ageData.series}
                type="bar"
                height={380}
                width="100%"
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;