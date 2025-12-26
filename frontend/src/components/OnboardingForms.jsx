import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    Typography,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Add, ContentCopy, Email, Visibility } from '@mui/icons-material';
import { getInfluencers } from '../services/api';
import { toast } from 'react-toastify';

function OnboardingForms({ user }) {
    const [influencers, setInfluencers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [emailModalOpen, setEmailModalOpen] = useState(false);
    const [emailAddress, setEmailAddress] = useState('');
    const [emailSending, setEmailSending] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchInfluencers();
    }, []);

    const fetchInfluencers = async () => {
        setLoading(true);
        try {
            const response = await getInfluencers();
            setInfluencers(response.data);
        } catch (error) {
            console.error('Failed to fetch influencers:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'success';
            case 'rejected': return 'error';
            default: return 'warning';
        }
    };

    const handleCopyUrl = () => {
        const formUrl = `${process.env.REACT_APP_BASE_URL}/#/form/${user?.id}/1`;
        navigator.clipboard.writeText(formUrl);
        toast.success('Form URL copied to clipboard!');
    };

    const handleSendEmail = async () => {
        if (!emailAddress) {
            toast.error('Please enter an email address');
            return;
        }
        setEmailSending(true);
        try {
            const { default: api } = await import('../services/api');
            const formUrl = `${process.env.REACT_APP_BASE_URL}/#/form/${user?.id}/0`;
            await api.post('/send-form-email', { email: emailAddress, formUrl: formUrl });
            setEmailModalOpen(false);
            setEmailAddress('');
            toast.success('Email sent successfully!');
        } catch (error) {
            toast.error('Failed to send email');
        } finally {
            setEmailSending(false);
        }
    };

    const columns = [
        { field: 'sno', headerName: 'SNO', width: 80 },
        { field: 'onboarderName', headerName: 'Onboard Name', width: 150 },
        { field: 'name', headerName: 'Name', width: 150 },
        { field: 'email', headerName: 'Email', width: 200 },
        {
            field: "totalcostinstagram",
            headerName: 'Total Cost Instagram',
            flex: 1,
            minWidth: 200,
            headerClassName: 'instagram-header',
            cellClassName: 'instagram-cell',
            renderCell: (params) => {
                const value = params.row?.reelCost;
                if (!value || isNaN(value)) return "-";
                return `₹${Number(value).toLocaleString()}`;
            }
        },
        {
            field: "AverageViewInstagram",
            headerName: 'Average view (Instagram)',
            flex: 1,
            minWidth: 200,
            headerClassName: 'instagram-header',
            cellClassName: 'instagram-cell',
            renderCell: (params) => {
                const totalViews = params.row?.allData?.last10ReelsViews;

                if (!totalViews || isNaN(totalViews)) {
                    return "-";
                }
                const average = Number(totalViews) / 10;
                return average;
            }
        },
        {
            field: "AverageReachInstagram",
            headerName: 'Average reach (Instagram)',
            flex: 1,
            minWidth: 200,
            headerClassName: 'instagram-header',
            cellClassName: 'instagram-cell',
            renderCell: (params) => {
                const totalReach = params.row?.allData?.last10ReelsReach;

                if (!totalReach || isNaN(totalReach)) {
                    return "-";
                }
                const average = Number(totalReach) / 10;
                return average;
            }
        },
        {
            field: "engagementRateInstagram",
            headerName: "Engagement Rate (Instagram)",
            flex: 1,
            minWidth: 200,
            headerClassName: 'instagram-header',
            cellClassName: 'instagram-cell',
            renderCell: (params) => {
                const likes = Number(params.row?.allData?.instagramLikes) || 0;
                const comments = Number(params.row?.allData?.instagramComments) || 0;
                const saves = Number(params.row?.allData?.instagramSaves) || 0;
                const shares = Number(params.row?.allData?.instagramShares) || 0;
                const reposts = Number(params.row?.allData?.instagramReposts) || 0;

                const totalReach = Number(params.row?.allData?.last10ReelsReach);
                if (!totalReach || isNaN(totalReach)) return "-";

                const avgReach = totalReach / 10;
                if (avgReach === 0) return "-";

                const engagementRate =
                    ((likes + comments + saves + shares + reposts) / avgReach) * 100;

                return Number(engagementRate.toFixed(2));
            }
        },
        {
            field: "totalcostyoutube",
            headerName: "Total Cost Youtube",
            flex: 1,
            minWidth: 200,
            headerClassName: 'youtube-header',
            cellClassName: 'youtube-cell',
            renderCell: (params) => {
                const shorts = params.row?.youtubeShortsCost;
                const video = params.row?.youtubeVideoCost;

                console.log(video, 'test');
                if (!shorts || !video) return "-";
                const total = shorts + video;
                return `₹${total.toLocaleString()}`;
            }
        },
        {
            field: "AverageViewYoutube",
            headerName: 'Average view (YouTube)',
            flex: 1,
            minWidth: 200,
            headerClassName: 'youtube-header',
            cellClassName: 'youtube-cell',
            renderCell: (params) => {
                const totalViews = params.row?.allData?.last10ShortsViews;

                if (!totalViews || isNaN(totalViews)) {
                    return "-";
                }
                const average = Number(totalViews) / 10;
                return average;
            }
        },
        {
            field: "AverageReachYoutube",
            headerName: 'Average React (YouTube)',
            flex: 1,
            minWidth: 200,
            headerClassName: 'youtube-header',
            cellClassName: 'youtube-cell',
            renderCell: (params) => {
                const totalReach = params.row?.allData?.last10ShortsReach;

                if (!totalReach || isNaN(totalReach)) {
                    return "-";
                }
                const average = Number(totalReach) / 10;
                return average;
            }
        },
        {
            field: "engagementRateYoutube",
            headerName: "Engagement Rate (Youtube)",
            flex: 1,
            minWidth: 230,
            headerClassName: 'youtube-header',
            cellClassName: 'youtube-cell',
            renderCell: (params) => {
                const likes = Number(params.row?.allData?.youtubeLikes);
                const comments = Number(params.row?.allData?.youtubeComments);
                const saves = Number(params.row?.allData?.youtubeSaves);
                const shares = Number(params.row?.allData?.youtubeShares);

                const totalReach = Number(params.row?.allData?.last10ShortsReach);
                if (!totalReach || isNaN(totalReach)) return "-";

                const avgReach = totalReach / 10;
                if (avgReach === 0) return "-";

                const engagementRate =
                    ((likes + comments + saves + shares) / avgReach) * 100;

                return Number(engagementRate.toFixed(2));
            }
        },
        // {
        //   field: 'status',
        //   headerName: 'Status',
        //   width: 100,
        //   renderCell: (params) => (
        //     <Chip
        //       label={params.value}
        //       color={getStatusColor(params.value)}
        //       size="small"
        //       sx={{ textTransform: 'capitalize' }}
        //     />
        //   )
        // },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 100,
            renderCell: (params) => (
                <Button
                    size="small"
                    startIcon={<Visibility />}
                    onClick={() => navigate(`/influencer/${params.row._id}`)}
                    sx={{ color: '#5386e4' }}
                >
                    View
                </Button>
            )
        }
    ];

    const rows = influencers.map((influencer, index) => ({
        id: influencer._id,
        sno: index + 1,
        name: influencer.name,
        email: influencer.email,
        onboarderName: influencer?.onboarderId?.name || 'N/A',
        platformType: influencer.platformType,
        reelCost: influencer?.reelCost,
        youtubeVideoCost: influencer?.youtubeVideoCost,
        youtubeShortsCost: influencer?.youtubeShortsCost,
        followers: (influencer.instagramFollowers || influencer.youtubeFollowers || 0).toLocaleString(),
        category: influencer.category,
        status: influencer.status,
        _id: influencer._id,
        allData: influencer
    }));

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" component="h1" sx={{ fontWeight: 600 }}>
                    Onboarding Forms
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="outlined"
                        startIcon={<ContentCopy />}
                        onClick={handleCopyUrl}
                        sx={{ borderColor: '#5386e4', color: '#5386e4' }}
                    >
                        Copy Form URL
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<Email />}
                        onClick={() => setEmailModalOpen(true)}
                        sx={{ bgcolor: '#5386e4', '&:hover': { bgcolor: '#4a7bd9' } }}
                    >
                        Send Email
                    </Button>
                    {/* <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/form')}
            sx={{ bgcolor: '#5386e4', '&:hover': { bgcolor: '#4a7bd9' } }}
          >
            Add New Influencer
          </Button> */}
                </Box>
            </Box>

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
                className="table_border"
                sx={{
                    boxShadow: 2,
                    backgroundColor: 'white',
                    '& .MuiDataGrid-columnHeaders': {
                        backgroundColor: '#f8f9fa'
                    },
                    '& .MuiDataGrid-iconSeparator': {
                        display: 'none'
                    },
                    '& .MuiDataGrid-row': {
                        backgroundColor: 'white',
                        borderLeft: 'solid 1px #e5e7eb',
                        borderRight: 'solid 1px #e5e7eb'
                    },
                    // '& .instagram-header': {
                    //   backgroundColor: '#ffeaa7 !important'
                    // },
                    '& .instagram-cell': {
                        backgroundColor: '#e8f4fcb7 !important'
                    },
                    // '& .youtube-header': {
                    //   backgroundColor: '#ff7675 !important',
                    //   color: 'white !important'
                    // },
                    '& .youtube-cell': {
                        backgroundColor: '#fff5e69a !important'
                    }
                }}
            />

            {/* Email Modal */}
            <Dialog open={emailModalOpen} onClose={() => setEmailModalOpen(false)} maxWidth="sm" fullWidth >
                <DialogTitle>Send Form URL via Email</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Email Address"
                        type="email"
                        value={emailAddress}
                        onChange={(e) => setEmailAddress(e.target.value)}
                        sx={{ mt: 2 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEmailModalOpen(false)} disabled={emailSending}>Cancel</Button>
                    <Button onClick={handleSendEmail} variant="contained" disabled={emailSending} sx={{ bgcolor: '#5386e4' }}>
                        {emailSending ? 'Sending...' : 'Send Email'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default OnboardingForms;