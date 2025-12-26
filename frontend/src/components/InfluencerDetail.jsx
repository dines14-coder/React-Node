import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  Chip,
  Divider
} from '@mui/material';
import { ArrowBackOutlined } from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../services/api';

function InfluencerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [influencer, setInfluencer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInfluencer();
  }, [id]);

  const fetchInfluencer = async () => {
    try {
      const response = await api.get(`/influencers/${id}`);
      setInfluencer(response.data);
    } catch (error) {
      toast.error('Failed to fetch influencer details');
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleImageClick = (imageSrc) => {
    window.open(imageSrc, '_blank');
  };

  if (loading) return <Box sx={{ p: 3 }}>Loading...</Box>;
  if (!influencer) return <Box sx={{ p: 3 }}>Influencer not found</Box>;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBackOutlined />}
          onClick={() => navigate('/onboard-forms')}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h6" component="h1" sx={{ fontWeight: 600 }}>
          Influencer Details
        </Typography>
        {/* <Chip
          label={influencer.status}
          color={getStatusColor(influencer.status)}
          sx={{ ml: 2, textTransform: 'capitalize' }}
        /> */}
      </Box>

      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ color: '#5386e4', mb: 2 }}>
              Basic Information
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">Name</Typography>
            <Typography variant="body1">{influencer.name}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">Email</Typography>
            <Typography variant="body1">{influencer.email}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">Date of Birth</Typography>
            <Typography variant="body1">{formatDate(influencer.dateOfBirth)}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">Age</Typography>
            <Typography variant="body1">{influencer.age}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">Gender</Typography>
            <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>{influencer.gender}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">Location</Typography>
            <Typography variant="body1">{influencer.location}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">Language</Typography>
            <Typography variant="body1">{influencer.language}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">Category</Typography>
            <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>{influencer.category}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">Brand Collaboration</Typography>
            <Typography variant="body1">{influencer.brandCollaboration || 'N/A'}</Typography>
          </Grid>

          <Grid item xs={12}><Divider /></Grid>

          {/* Contact Information */}
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ color: '#5386e4', mb: 2 }}>
              Contact Information
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">Contact Number</Typography>
            <Typography variant="body1">{influencer.contactNumber}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">Instagram Link</Typography>
            <Typography variant="body1">{influencer.instagramLink || 'N/A'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">YouTube Link</Typography>
            <Typography variant="body1">{influencer.youtubeLink || 'N/A'}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary">Address</Typography>
            <Typography variant="body1">{influencer.address}</Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="body2" color="text.secondary">Pincode</Typography>
            <Typography variant="body1">{influencer.pincode}</Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="body2" color="text.secondary">State</Typography>
            <Typography variant="body1">{influencer.state}</Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="body2" color="text.secondary">City</Typography>
            <Typography variant="body1">{influencer.city}</Typography>
          </Grid>

          <Grid item xs={12}><Divider /></Grid>

          {/* Platform Information */}
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ color: '#5386e4', mb: 2 }}>
              Platform Information
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">Platform Type</Typography>
            <Typography variant="body1">{influencer.platformType}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">Social Media Platforms</Typography>
            <Typography variant="body1">{influencer.socialMediaPlatforms}</Typography>
          </Grid>

          {/* Instagram Details */}
          {(influencer.socialMediaPlatforms?.includes('instagram') || influencer.instagramFollowers) && (
            <>
              <Grid item xs={12}><Divider /></Grid>
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ color: '#5386e4', mb: 2 }}>
                  Instagram Details
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Followers</Typography>
                <Typography variant="body1">{influencer.instagramFollowers?.toLocaleString() || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Content Cost (Reel + Story)</Typography>
                <Typography variant="body1">₹{influencer.reelCost || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Last 10 Reels Views</Typography>
                <Typography variant="body1">{influencer.last10ReelsViews || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Last 10 Reels Reach</Typography>
                <Typography variant="body1">{influencer.last10ReelsReach || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Instagram Likes</Typography>
                <Typography variant="body1">{influencer.instagramLikes || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Instagram Comments</Typography>
                <Typography variant="body1">{influencer.instagramComments || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Instagram Saves</Typography>
                <Typography variant="body1">{influencer.instagramSaves || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Instagram Shares</Typography>
                <Typography variant="body1">{influencer.instagramShares || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Instagram Reposts</Typography>
                <Typography variant="body1">{influencer.instagramReposts || 'N/A'}</Typography>
              </Grid>
            </>
          )}

          {/* YouTube Details */}
          {(influencer.socialMediaPlatforms?.includes('youtube') || influencer.youtubeFollowers) && (
            <>
              <Grid item xs={12}><Divider /></Grid>
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ color: '#5386e4', mb: 2 }}>
                  YouTube Details
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Followers</Typography>
                <Typography variant="body1">{influencer.youtubeFollowers?.toLocaleString() || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Video Cost</Typography>
                <Typography variant="body1">₹{influencer.youtubeVideoCost || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Shorts Cost</Typography>
                <Typography variant="body1">₹{influencer.youtubeShortsCost || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Last 10 Shorts Views</Typography>
                <Typography variant="body1">{influencer.last10ShortsViews || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Last 10 Shorts Reach</Typography>
                <Typography variant="body1">{influencer.last10ShortsReach || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">YouTube Likes</Typography>
                <Typography variant="body1">{influencer.youtubeLikes || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">YouTube Comments</Typography>
                <Typography variant="body1">{influencer.youtubeComments || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">YouTube Saves</Typography>
                <Typography variant="body1">{influencer.youtubeSaves || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">YouTube Shares</Typography>
                <Typography variant="body1">{influencer.youtubeShares || 'N/A'}</Typography>
              </Grid>
            </>
          )}

          <Grid item xs={12}><Divider /></Grid>

          {/* Banking Information */}
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ color: '#5386e4', mb: 2 }}>
              Banking Information
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">PAN Number</Typography>
            <Typography variant="body1">{influencer.panNumber}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">Bank Account Number</Typography>
            <Typography variant="body1">{influencer.bankAccountNumber}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">IFSC Code</Typography>
            <Typography variant="body1">{influencer.ifscCode}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">Account Holder Name</Typography>
            <Typography variant="body1">{influencer.holderName}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary">Bank Name</Typography>
            <Typography variant="body1">{influencer.bankName}</Typography>
          </Grid>

          <Grid item xs={12}><Divider /></Grid>

          {/* Document Images */}
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ color: '#5386e4', mb: 2 }}>
              Uploaded Documents
            </Typography>
          </Grid>
          {influencer.instagramGenderScreenshot && (
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Instagram Gender Screenshot</Typography>
              <Box component="img" src={`${process.env.REACT_APP_NODE_BASE_URL}/uploads/${influencer.instagramGenderScreenshot}`} alt="Instagram Gender" sx={{ height: '100px', width: 'auto', border: '1px solid #ddd', borderRadius: 1, cursor: 'pointer' }} onClick={() => handleImageClick(`${process.env.REACT_APP_NODE_BASE_URL}/uploads/${influencer.instagramGenderScreenshot}`)} />
            </Grid>
          )}
          {influencer.instagramAgeScreenshot && (
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Instagram Age Screenshot</Typography>
              <Box component="img" src={`${process.env.REACT_APP_NODE_BASE_URL}/uploads/${influencer.instagramAgeScreenshot}`} alt="Instagram Age" sx={{ height: '100px', width: 'auto', border: '1px solid #ddd', borderRadius: 1, cursor: 'pointer' }} onClick={() => handleImageClick(`${process.env.REACT_APP_NODE_BASE_URL}/uploads/${influencer.instagramAgeScreenshot}`)} />
            </Grid>
          )}
          {influencer.panCardImage && (
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>PAN Card Image</Typography>
              <Box component="img" src={`${process.env.REACT_APP_NODE_BASE_URL}/uploads/${influencer.panCardImage}`} alt="PAN Card" sx={{ height: '100px', width: 'auto', border: '1px solid #ddd', borderRadius: 1, cursor: 'pointer' }} onClick={() => handleImageClick(`${process.env.REACT_APP_NODE_BASE_URL}/uploads/${influencer.panCardImage}`)} />
            </Grid>
          )}
          {influencer.bankPassbookImage && (
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Bank Passbook Image</Typography>
              <Box component="img" src={`${process.env.REACT_APP_NODE_BASE_URL}/uploads/${influencer.bankPassbookImage}`} alt="Bank Passbook" sx={{ height: '100px', width: 'auto', border: '1px solid #ddd', borderRadius: 1, cursor: 'pointer' }} onClick={() => handleImageClick(`${process.env.REACT_APP_NODE_BASE_URL}/uploads/${influencer.bankPassbookImage}`)} />
            </Grid>
          )}
          {influencer.gstCertificate && (
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>GST Certificate</Typography>
              <Box component="img" src={`${process.env.REACT_APP_NODE_BASE_URL}/uploads/${influencer.gstCertificate}`} alt="GST Certificate" sx={{ height: '100px', width: 'auto', border: '1px solid #ddd', borderRadius: 1, cursor: 'pointer' }} onClick={() => handleImageClick(`${process.env.REACT_APP_NODE_BASE_URL}/uploads/${influencer.gstCertificate}`)} />
            </Grid>
          )}

          <Grid item xs={12}><Divider /></Grid>

          {/* Additional Information */}
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ color: '#5386e4', mb: 2 }}>
              Additional Information
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">Delivery Address Same</Typography>
            <Typography variant="body1">{influencer.deliveryAddressSame}</Typography>
          </Grid>
          {influencer.deliveryAddress && (
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">Delivery Address</Typography>
              <Typography variant="body1">{influencer.deliveryAddress}</Typography>
            </Grid>
          )}
          {influencer.remarks && (
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">Remarks</Typography>
              <Typography variant="body1">{influencer.remarks}</Typography>
            </Grid>
          )}
        </Grid>
      </Paper>
    </Box>
  );
}

export default InfluencerDetail;