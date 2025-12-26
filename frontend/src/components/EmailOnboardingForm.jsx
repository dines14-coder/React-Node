import React, { useState } from 'react';
import {
    Box,
    TextField,
    Button,
    MenuItem,
    Grid,
    Typography,
    Radio,
    FormControlLabel,
    Checkbox,
    CircularProgress
} from '@mui/material';
import { RadioGroup } from '@mui/material';
import { toast } from 'react-toastify';

function EmailOnboardingForm({ onSuccess, onboardedId }) {
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [showThankYou, setShowThankYou] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        dateOfBirth: '',
        name: '',
        location: '',
        age: '',
        gender: '',
        language: '',
        category: '',
        brandCollaboration: '',
        instagramLink: '',
        youtubeLink: '',
        contactNumber: '',
        address: '',
        pincode: '',
        state: '',
        city: '',
        platformType: 'Paid',
        socialMediaPlatforms: [],
        // Instagram fields
        reelCost: '',
        storyCost: '',
        instagramFollowers: '',
        instagramGenderScreenshot: null,
        instagramAgeScreenshot: null,
        instagramDemographyScreenshot: null,
        last10ReelsViews: '',
        last10ReelsReach: '',
        instagramLikes: '',
        instagramComments: '',
        instagramSaves: '',
        instagramShares: '',
        instagramReposts: '',
        // YouTube fields
        youtubeVideoCost: '',
        youtubeShortsCost: '',
        youtubeFollowers: '',
        last10ShortsViews: '',
        last10ShortsReach: '',
        youtubeLikes: '',
        youtubeComments: '',
        youtubeSaves: '',
        youtubeShares: '',
        // Banking fields
        panNumber: '',
        bankAccountNumber: '',
        ifscCode: '',
        holderName: '',
        bankName: '',
        bankPassbookImage: null,
        panCardImage: null,
        gstCertificate: null,
        deliveryAddressSame: 'yes',
        deliveryAddress: '',
        agreeTerms: false,
        remarks: '',
        onboarderId: onboardedId
    });

    const calculateAge = (dateOfBirth) => {
        if (!dateOfBirth) return '';
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age.toString();
    };

    const getStateCityFromPincode = async (pincode) => {
        try {
            if (!pincode || pincode.length !== 6) return null;
            const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
            const data = await res.json();
            if (data[0].Status === 'Success') {
                const office = data[0].PostOffice[0];
                return {
                    state: office.State,
                    city: office.District
                };
            }
            return null;
        } catch (err) {
            console.error('Pincode API Error:', err);
            return null;
        }
    };

    const handleChange = async (e) => {
        const { name, value, type, checked, files } = e.target;

        let updatedFormData = {
            ...formData,
            [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] : value
        };

        // Auto-fill age when date of birth changes
        if (name === 'dateOfBirth') {
            updatedFormData.age = calculateAge(value);
        }

        // Auto-fill state and city when pincode changes
        if (name === 'pincode' && value.length === 6) {
            const locationData = await getStateCityFromPincode(value);
            if (locationData) {
                updatedFormData.state = locationData.state;
                updatedFormData.city = locationData.city;
            }
        }

        setFormData(updatedFormData);
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name) newErrors.name = 'Name is required';
        if (!formData.email) newErrors.email = 'Email is required';
        if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of Birth is required';
        if (!formData.location) newErrors.location = 'Location is required';
        if (!formData.age) newErrors.age = 'Age is required';
        if (!formData.gender) newErrors.gender = 'Gender is required';
        if (!formData.language) newErrors.language = 'Language is required';
        if (!formData.category) newErrors.category = 'Category is required';

        // Contact number validation
        if (!formData.contactNumber) {
            newErrors.contactNumber = 'Contact Number is required';
        } else if (!/^[0-9]{10}$/.test(formData.contactNumber)) {
            newErrors.contactNumber = 'Contact Number must be 10 digits';
        }

        // Instagram profile link validation
        if (formData.instagramLink && !formData.instagramLink.startsWith('https://')) {
            newErrors.instagramLink = 'Instagram link must start with https://';
        }

        // YouTube profile link validation
        if (formData.youtubeLink && !formData.youtubeLink.startsWith('https://')) {
            newErrors.youtubeLink = 'YouTube link must start with https://';
        }

        if (!formData.address) newErrors.address = 'Address is required';
        if (!formData.pincode) newErrors.pincode = 'Pincode is required';
        if (!formData.state) newErrors.state = 'State is required';
        if (!formData.city) newErrors.city = 'City is required';
        if (!formData.socialMediaPlatforms.length) newErrors.socialMediaPlatforms = 'Select at least one platform';

        // PAN number validation
        if (!formData.panNumber) {
            newErrors.panNumber = 'PAN Number is required';
        } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNumber)) {
            newErrors.panNumber = 'PAN Number format: ABCDE1234F';
        }

        if (!formData.bankAccountNumber) newErrors.bankAccountNumber = 'Bank Account Number is required';
        if (!formData.ifscCode) newErrors.ifscCode = 'IFSC Code is required';
        if (!formData.holderName) newErrors.holderName = 'Account Holder Name is required';
        if (!formData.bankName) newErrors.bankName = 'Bank Name is required';
        if (!formData.panCardImage) newErrors.panCardImage = 'PAN Card Image is required';
        if (!formData.bankPassbookImage) newErrors.bankPassbookImage = 'Bank Passbook Image is required';
        if (!formData.agreeTerms) newErrors.agreeTerms = 'You must agree to terms and conditions';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setLoading(true);
        try {
            const formDataToSend = new FormData();

            // Append all form fields
            Object.keys(formData).forEach(key => {
                if (key === 'socialMediaPlatforms') {
                    formDataToSend.append(key, formData[key].join(','));
                } else if (formData[key] !== null && formData[key] !== '') {
                    formDataToSend.append(key, formData[key]);
                }
            });

            const { onboardInfluencerWithFiles } = await import('../services/api');
            const response = await onboardInfluencerWithFiles(formDataToSend);

            console.log('Response:', response.data);
            setShowThankYou(true);
            
            // Reset form
            setFormData({
                email: '', dateOfBirth: '', name: '', location: '', age: '', gender: '', language: '', category: '',
                brandCollaboration: '', instagramLink: '', youtubeLink: '', contactNumber: '', address: '', pincode: '',
                state: '', city: '', platformType: 'Paid', socialMediaPlatforms: [], reelCost: '', storyCost: '',
                instagramFollowers: '', instagramGenderScreenshot: null, instagramAgeScreenshot: null, instagramDemographyScreenshot: null, last10ReelsViews: '',
                last10ReelsReach: '', instagramLikes: '', instagramComments: '', instagramSaves: '', instagramShares: '',
                instagramReposts: '', youtubeVideoCost: '', youtubeShortsCost: '', youtubeFollowers: '', last10ShortsViews: '',
                last10ShortsReach: '', youtubeLikes: '', youtubeComments: '', youtubeSaves: '', youtubeShares: '',
                panNumber: '', bankAccountNumber: '', ifscCode: '', holderName: '', bankName: '', bankPassbookImage: null,
                panCardImage: null, gstCertificate: null, deliveryAddressSame: 'yes', deliveryAddress: '', agreeTerms: false, remarks: ''
            });
            setErrors({});
        } catch (error) {
            console.error('Form submission error:', error);

            if (error.response?.data) {
                const errorData = error.response.data;
                if (errorData.details) {
                    toast.error(`Validation Error: ${errorData.details.join(', ')}`);
                } else {
                    toast.error(errorData.error || errorData.message || 'Error submitting application');
                }
            } else {
                toast.error('Network error. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleThankYouClose = () => {
        setShowThankYou(false);
        if (onSuccess) onSuccess();
    };

    if (showThankYou) {
        const ThankYou = React.lazy(() => import('./ThankYou'));
        return (
            <React.Suspense fallback={<div>Loading...</div>}>
                <ThankYou onClose={handleThankYouClose} />
            </React.Suspense>
        );
    }

    return (
        <Box sx={{ p: 2 }}>
            <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                    {/* Basic Information */}
                    <Grid item xs={12}>
                        <Typography variant="h6" sx={{ color: '#5386e4', mb: 2 }}>
                            Basic Information
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Name of Influencer" name="name" value={formData.name} onChange={handleChange} error={!!errors.name} helperText={errors.name} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Email" name="email" type="email" value={formData.email} onChange={handleChange} error={!!errors.email} helperText={errors.email} />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Date of Birth" name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} InputLabelProps={{ shrink: true }} error={!!errors.dateOfBirth} helperText={errors.dateOfBirth} />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Location" name="location" value={formData.location} onChange={handleChange} error={!!errors.location} helperText={errors.location} />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                        <TextField fullWidth label="Age" name="age" type="number" value={formData.age} onChange={handleChange} disabled error={!!errors.age} helperText={errors.age} />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                        <TextField fullWidth select label="Gender" name="gender" value={formData.gender} onChange={handleChange} error={!!errors.gender} helperText={errors.gender}>
                            <MenuItem value="male">Male</MenuItem>
                            <MenuItem value="female">Female</MenuItem>
                            <MenuItem value="other">Other</MenuItem>
                        </TextField>
                    </Grid>

                    <Grid item xs={12} sm={4}>
                        <TextField fullWidth label="Language" name="language" value={formData.language} onChange={handleChange} error={!!errors.language} helperText={errors.language} />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField fullWidth select label="Category" name="category" value={formData.category} onChange={handleChange} error={!!errors.category} helperText={errors.category}>
                            <MenuItem value="lifestyle">Lifestyle</MenuItem>
                            <MenuItem value="fashion">Fashion</MenuItem>
                            <MenuItem value="tech">Technology</MenuItem>
                            <MenuItem value="fitness">Fitness</MenuItem>
                            <MenuItem value="food">Food</MenuItem>
                        </TextField>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Brand Collaboration" name="brandCollaboration" value={formData.brandCollaboration} onChange={handleChange} />
                    </Grid>

                    {/* Contact Information */}
                    <Grid item xs={12}>
                        <Typography variant="h6" sx={{ color: '#5386e4', mb: 2, mt: 2 }}>
                            Contact Information
                        </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Instagram Profile Link" name="instagramLink" value={formData.instagramLink} onChange={handleChange} error={!!errors.instagramLink} helperText={errors.instagramLink} />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="YouTube Profile Link" name="youtubeLink" value={formData.youtubeLink} onChange={handleChange} error={!!errors.youtubeLink} helperText={errors.youtubeLink} />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Contact Number" name="contactNumber" value={formData.contactNumber} onChange={handleChange} error={!!errors.contactNumber} helperText={errors.contactNumber} />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField fullWidth label="Complete Address" name="address" multiline rows={3} value={formData.address} onChange={handleChange} error={!!errors.address} helperText={errors.address} />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                        <TextField fullWidth label="Pincode" name="pincode" value={formData.pincode} onChange={handleChange} error={!!errors.pincode} helperText={errors.pincode} />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                        <TextField fullWidth label="State" name="state" value={formData.state} onChange={handleChange} disabled error={!!errors.state} helperText={errors.state} />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                        <TextField fullWidth label="City" name="city" value={formData.city} onChange={handleChange} disabled error={!!errors.city} helperText={errors.city} />
                    </Grid>

                    {/* Platform Information */}
                    <Grid item xs={12}>
                        <Typography variant="h6" sx={{ color: '#5386e4', mb: 2, mt: 2 }}>
                            Platform Information
                        </Typography>
                    </Grid>

                    <Grid item xs={12}>
                        <Typography variant="body2" sx={{ mb: 1 }}>Platform Type:</Typography>
                        <RadioGroup row name="platformType" value={formData.platformType} onChange={handleChange}>
                            <FormControlLabel value="Paid" control={<Radio />} label="Paid" />
                            <FormControlLabel value="Barter" control={<Radio />} label="Barter" />
                        </RadioGroup>
                    </Grid>

                    <Grid item xs={12}>
                        <TextField fullWidth select label="Social Media Platforms" name="socialMediaPlatforms" value={formData.socialMediaPlatforms} onChange={handleChange} SelectProps={{ multiple: true }} error={!!errors.socialMediaPlatforms} helperText={errors.socialMediaPlatforms}>
                            <MenuItem value="instagram">Instagram</MenuItem>
                            <MenuItem value="youtube">YouTube</MenuItem>
                        </TextField>
                    </Grid>

                    {/* Instagram Section */}
                    {formData.socialMediaPlatforms.includes('instagram') && (
                        <>
                            <Grid item xs={12}>
                                <Typography variant="h6" sx={{ color: '#5386e4', mb: 2, mt: 2 }}>
                                    Instagram Details
                                </Typography>
                            </Grid>

                            {formData.platformType === 'Paid' && (
                                <>
                                    <Grid item xs={12} sm={6}>
                                        <TextField fullWidth label="Content Cost (Reel + Story)" name="reelCost" type="number" value={formData.reelCost} onChange={handleChange} />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField fullWidth label="Last 10 Reels Views" name="last10ReelsViews" type="number" value={formData.last10ReelsViews} onChange={handleChange} />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField fullWidth label="Last 10 Reels Reach" name="last10ReelsReach" type="number" value={formData.last10ReelsReach} onChange={handleChange} />
                                    </Grid>
                                </>
                            )}

                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Instagram Followers" name="instagramFollowers" type="number" value={formData.instagramFollowers} onChange={handleChange} />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Instagram Likes" name="instagramLikes" type="number" value={formData.instagramLikes} onChange={handleChange} />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Instagram Comments" name="instagramComments" type="number" value={formData.instagramComments} onChange={handleChange} />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Instagram Saves" name="instagramSaves" type="number" value={formData.instagramSaves} onChange={handleChange} />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Instagram Shares" name="instagramShares" type="number" value={formData.instagramShares} onChange={handleChange} />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Instagram Reposts" name="instagramReposts" type="number" value={formData.instagramReposts} onChange={handleChange} />
                            </Grid>
                        </>
                    )}

                    {/* YouTube Section */}
                    {formData.socialMediaPlatforms.includes('youtube') && (
                        <>
                            <Grid item xs={12}>
                                <Typography variant="h6" sx={{ color: '#5386e4', mb: 2, mt: 2 }}>
                                    YouTube Details
                                </Typography>
                            </Grid>

                            {formData.platformType === 'Paid' && (
                                <>
                                    <Grid item xs={12} sm={6}>
                                        <TextField fullWidth label="YouTube Video Cost" name="youtubeVideoCost" type="number" value={formData.youtubeVideoCost} onChange={handleChange} />
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <TextField fullWidth label="YouTube Shorts Cost" name="youtubeShortsCost" type="number" value={formData.youtubeShortsCost} onChange={handleChange} />
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <TextField fullWidth label="Last 10 Shorts Views" name="last10ShortsViews" type="number" value={formData.last10ShortsViews} onChange={handleChange} />
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <TextField fullWidth label="Last 10 Shorts Reach" name="last10ShortsReach" type="number" value={formData.last10ShortsReach} onChange={handleChange} />
                                    </Grid>
                                </>
                            )}

                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="YouTube Followers" name="youtubeFollowers" type="number" value={formData.youtubeFollowers} onChange={handleChange} />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="YouTube Likes" name="youtubeLikes" type="number" value={formData.youtubeLikes} onChange={handleChange} />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="YouTube Comments" name="youtubeComments" type="number" value={formData.youtubeComments} onChange={handleChange} />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="YouTube Saves" name="youtubeSaves" type="number" value={formData.youtubeSaves} onChange={handleChange} />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="YouTube Shares" name="youtubeShares" type="number" value={formData.youtubeShares} onChange={handleChange} />
                            </Grid>
                        </>
                    )}

                    {/* File Uploads */}
                    <Grid item xs={12}>
                        <Typography variant="h6" sx={{ color: '#5386e4', mb: 2, mt: 2 }}>
                            Document Uploads
                        </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Typography variant="body2" sx={{ mb: 1 }}>Instagram Gender Screenshot</Typography>
                        <TextField
                            fullWidth
                            type="file"
                            name="instagramGenderScreenshot"
                            onChange={handleChange}
                            inputProps={{ accept: 'image/*' }}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Typography variant="body2" sx={{ mb: 1 }}>Instagram Age Screenshot</Typography>
                        <TextField
                            fullWidth
                            type="file"
                            name="instagramAgeScreenshot"
                            onChange={handleChange}
                            inputProps={{ accept: 'image/*' }}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Typography variant="body2" sx={{ mb: 1 }}>Instagram Demography Screenshot</Typography>
                        <TextField
                            fullWidth
                            type="file"
                            name="instagramDemographyScreenshot"
                            onChange={handleChange}
                            inputProps={{ accept: 'image/*' }}
                        />
                    </Grid>

                    {/* Banking Information */}
                    <Grid item xs={12}>
                        <Typography variant="h6" sx={{ color: '#5386e4', mb: 2, mt: 2 }}>
                            Banking Information
                        </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6} sx={{ marginTop: '28px' }}>
                        <TextField fullWidth label="PAN Number" name="panNumber" value={formData.panNumber} onChange={handleChange} error={!!errors.panNumber} helperText={errors.panNumber} />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Typography variant="body2" sx={{ mb: 1 }}> PAN Card Image </Typography>
                        <TextField
                            fullWidth
                            type="file"
                            name="panCardImage"
                            onChange={handleChange}
                            inputProps={{ accept: 'image/*,application/pdf' }}
                            error={!!errors.panCardImage}
                        />
                        {errors.panCardImage && <Typography color="error" variant="caption" sx={{ display: 'block', mt: 1 }}>{errors.panCardImage}</Typography>}
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Bank Account Number" name="bankAccountNumber" value={formData.bankAccountNumber} onChange={handleChange} error={!!errors.bankAccountNumber} helperText={errors.bankAccountNumber} />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="IFSC Code" name="ifscCode" value={formData.ifscCode} onChange={handleChange} error={!!errors.ifscCode} helperText={errors.ifscCode} />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Account Holder Name" name="holderName" value={formData.holderName} onChange={handleChange} error={!!errors.holderName} helperText={errors.holderName} />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField fullWidth label="Bank Name" name="bankName" value={formData.bankName} onChange={handleChange} error={!!errors.bankName} helperText={errors.bankName} />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Typography variant="body2" sx={{ mb: 1 }}>Bank Passbook Image</Typography>
                        <TextField
                            fullWidth
                            type="file"
                            name="bankPassbookImage"
                            onChange={handleChange}
                            inputProps={{ accept: 'image/*,application/pdf' }}
                            error={!!errors.bankPassbookImage}
                        />
                        {errors.bankPassbookImage && <Typography color="error" variant="caption" sx={{ display: 'block', mt: 1 }}>{errors.bankPassbookImage}</Typography>}
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Typography variant="body2" sx={{ mb: 1 }}>GST Certificate</Typography>
                        <TextField
                            fullWidth
                            type="file"
                            name="gstCertificate"
                            onChange={handleChange}
                            inputProps={{ accept: 'image/*,application/pdf' }}
                        />
                    </Grid>

                    {/* Delivery Address */}
                    <Grid item xs={12}>
                        <Typography variant="body2" sx={{ mb: 1, mt: 2 }}>Product delivery address same as above?</Typography>
                        <RadioGroup row name="deliveryAddressSame" value={formData.deliveryAddressSame} onChange={handleChange}>
                            <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                            <FormControlLabel value="no" control={<Radio />} label="No" />
                        </RadioGroup>
                    </Grid>

                    {formData.deliveryAddressSame === 'no' && (
                        <Grid item xs={12}>
                            <TextField fullWidth label="Delivery Address" name="deliveryAddress" multiline rows={3} value={formData.deliveryAddress} onChange={handleChange} />
                        </Grid>
                    )}

                    <Grid item xs={12}>
                        <TextField fullWidth label="Remarks" name="remarks" multiline rows={3} value={formData.remarks} onChange={handleChange} />
                    </Grid>

                    <Grid item xs={12}>
                        <FormControlLabel
                            control={<Checkbox name="agreeTerms" checked={formData.agreeTerms} onChange={handleChange} />}
                            label="I agree to the terms and conditions"
                        />
                        {errors.agreeTerms && <Typography color="error" variant="caption" sx={{ display: 'block', mt: 1 }}>{errors.agreeTerms}</Typography>}
                    </Grid>

                    <Grid item xs={12}>
                        <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            fullWidth
                            disabled={loading}
                            sx={{
                                bgcolor: '#5386e4',
                                '&:hover': { bgcolor: '#4a7bd9' },
                                mt: 2,
                                py: 1.5
                            }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Submit Application'}
                        </Button>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
}

export default EmailOnboardingForm;