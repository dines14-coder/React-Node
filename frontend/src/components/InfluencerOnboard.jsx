import React, { useState, useEffect, useRef } from 'react';
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
import { getExistingInfluencerById, updateInfluencerStatus, onboardInfluencerWithFiles } from '../services/api';
import { Link } from 'react-router-dom';
import { influencerLogo } from '../assets/images';
// const { onboardInfluencerWithFiles } = await import('../services/api');

function InfluencerOnboard({ onSuccess, onboardedId, type, existingId }) {
    const formRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [showThankYou, setShowThankYou] = useState(false);
    const [isVerified, setIsVerified] = useState(type == 0 ? true : false);
    const [verifiedMobile, setVerifiedMobile] = useState('');
    const [existingInfluencer, setExistingInfluencer] = useState(null);

    const scrollToFirstError = (errorKeys) => {
        if (!formRef.current || errorKeys.length === 0) return;

        const firstErrorKey = errorKeys[0];
        const element = formRef.current.querySelector(`[name="${firstErrorKey}"]`);

        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.focus();
        }
    };

    // if (existingId) {
    //     console.log(existingId, 'existingId');
    // } else {
    //     console.log("no id");
    // }


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

    useEffect(() => {
        const fetchExistingInfluencer = async () => {
            if (existingId) {
                try {
                    const response = await getExistingInfluencerById(existingId);
                    const influencer = response.data.data;
                    console.log(influencer, 'existing influencer');
                    setExistingInfluencer(influencer);

                    setFormData(prev => ({
                        ...prev,
                        name: influencer.name || '',
                        language: influencer.market || '',
                        instagramLink: influencer.profileLink || ''
                    }));
                } catch (error) {
                    console.error('Failed to fetch existing influencer:', error);
                }
            }
        };

        fetchExistingInfluencer();
    }, [onboardedId, type]);

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

    const validateFile = (file, fieldName) => {
        const maxSize = 5 * 1024 * 1024; // 5MB
        const allowedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];

        if (!file) return null;

        if (file.size > maxSize) {
            return `${fieldName} must be less than 5MB`;
        }

        if (!allowedFormats.includes(file.type)) {
            return `${fieldName} must be JPG, PNG, or PDF format`;
        }

        return null;
    };

    const handleChange = async (e) => {
        const { name, value, type, checked, files } = e.target;

        let updatedFormData = {
            ...formData,
            [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] : value
        };

        // File validation
        if (type === 'file' && files[0]) {
            const fileError = validateFile(files[0], name);
            if (fileError) {
                setErrors(prev => ({ ...prev, [name]: fileError }));
                return;
            } else {
                setErrors(prev => ({ ...prev, [name]: '' }));
            }
        }

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

        // Instagram validation
        if (formData.socialMediaPlatforms.includes('instagram')) {
            if (!formData.instagramFollowers) newErrors.instagramFollowers = 'Instagram Followers is required';
            if (!formData.instagramLikes) newErrors.instagramLikes = 'Instagram Likes is required';
            if (!formData.instagramComments) newErrors.instagramComments = 'Instagram Comments is required';
            if (!formData.instagramSaves) newErrors.instagramSaves = 'Instagram Saves is required';
            if (!formData.instagramShares) newErrors.instagramShares = 'Instagram Shares is required';
            if (!formData.instagramReposts) newErrors.instagramReposts = 'Instagram Reposts is required';
            if (!formData.instagramGenderScreenshot) newErrors.instagramGenderScreenshot = 'Instagram Gender Screenshot is required';
            if (!formData.instagramAgeScreenshot) newErrors.instagramAgeScreenshot = 'Instagram Age Screenshot is required';
            if (!formData.instagramDemographyScreenshot) newErrors.instagramDemographyScreenshot = 'Instagram Demography Screenshot is required';

            if (formData.platformType === 'Paid') {
                if (!formData.reelCost) newErrors.reelCost = 'Content Cost is required for Paid platform';
                if (!formData.last10ReelsViews) newErrors.last10ReelsViews = 'Last 10 Reels Views is required';
                if (!formData.last10ReelsReach) newErrors.last10ReelsReach = 'Last 10 Reels Reach is required';
            }
        }

        // YouTube validation
        if (formData.socialMediaPlatforms.includes('youtube')) {
            if (!formData.youtubeFollowers) newErrors.youtubeFollowers = 'YouTube Followers is required';
            if (!formData.youtubeLikes) newErrors.youtubeLikes = 'YouTube Likes is required';
            if (!formData.youtubeComments) newErrors.youtubeComments = 'YouTube Comments is required';
            if (!formData.youtubeSaves) newErrors.youtubeSaves = 'YouTube Saves is required';
            if (!formData.youtubeShares) newErrors.youtubeShares = 'YouTube Shares is required';

            if (formData.platformType === 'Paid') {
                if (!formData.youtubeVideoCost) newErrors.youtubeVideoCost = 'YouTube Video Cost is required for Paid platform';
                if (!formData.youtubeShortsCost) newErrors.youtubeShortsCost = 'YouTube Shorts Cost is required for Paid platform';
                if (!formData.last10ShortsViews) newErrors.last10ShortsViews = 'Last 10 Shorts Views is required';
                if (!formData.last10ShortsReach) newErrors.last10ShortsReach = 'Last 10 Shorts Reach is required';
            }
        }

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
        return { isValid: Object.keys(newErrors).length === 0, errors: newErrors };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validation = validateForm();
        if (!validation.isValid) {
            const errorKeys = Object.keys(validation.errors);
            scrollToFirstError(errorKeys);
            return;
        }
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

            const response = await onboardInfluencerWithFiles(formDataToSend);
            if (existingInfluencer) {
                await updateInfluencerStatus(existingInfluencer._id, 'completed', null, response.data.influencer.id);
            }

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

    const handleOTPVerified = (mobile) => {
        setIsVerified(true);
        setVerifiedMobile(mobile);
        setFormData(prev => ({ ...prev, contactNumber: mobile }));
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

    const OTPVerification = React.lazy(() => import('./OTPVerification'));

    return (
        <Box sx={{ p: 2 }}>
            {type == 1 && !isVerified && (
                <React.Suspense fallback={<div>Loading...</div>}>
                    <OTPVerification onVerified={handleOTPVerified} />
                </React.Suspense>
            )}
            <Box ref={formRef} component="form" onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                    {/* Basic Information */}
                    <Grid item xs={12}>
                        <Typography variant="h6" sx={{ color: '#5386e4', mb: 2 }}>
                            Basic Information
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Name of Influencer" name="name" value={formData.name} onChange={handleChange} error={!!errors.name} helperText={errors.name} disabled={!isVerified} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Email" name="email" type="email" value={formData.email} onChange={handleChange} error={!!errors.email} helperText={errors.email} disabled={!isVerified} />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Date of Birth" name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} InputLabelProps={{ shrink: true }} error={!!errors.dateOfBirth} helperText={errors.dateOfBirth} disabled={!isVerified} />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Location" name="location" value={formData.location} onChange={handleChange} error={!!errors.location} helperText={errors.location} disabled={!isVerified} />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                        <TextField fullWidth label="Age" name="age" type="number" value={formData.age} onChange={handleChange} disabled error={!!errors.age} helperText={errors.age} />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                        <TextField fullWidth select label="Gender" name="gender" value={formData.gender} onChange={handleChange} error={!!errors.gender} helperText={errors.gender} disabled={!isVerified}>
                            <MenuItem value="male">Male</MenuItem>
                            <MenuItem value="female">Female</MenuItem>
                            <MenuItem value="other">Other</MenuItem>
                        </TextField>
                    </Grid>

                    <Grid item xs={12} sm={4}>
                        <TextField fullWidth label="Language" name="language" value={formData.language} onChange={handleChange} error={!!errors.language} helperText={errors.language} disabled={!isVerified} />
                    </Grid>

                    {/* <Grid item xs={12} sm={6}>
                        <TextField fullWidth select label="Category" name="category" value={formData.category} onChange={handleChange} error={!!errors.category} helperText={errors.category} disabled={!isVerified}>
                            <MenuItem value="lifestyle">Lifestyle</MenuItem>
                            <MenuItem value="fashion">Fashion</MenuItem>
                            <MenuItem value="tech">Technology</MenuItem>
                            <MenuItem value="fitness">Fitness</MenuItem>
                            <MenuItem value="food">Food</MenuItem>
                        </TextField>
                    </Grid> */}
                    <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Category" name="category" placeholder='Ex: Beauty, Lifestyle' value={formData.category} onChange={handleChange} error={!!errors.category} helperText={errors.category} disabled={!isVerified} />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Brand Collaboration (Last 3 months)" name="brandCollaboration" placeholder='Ex: Spinz, Cavin’s, Dove' value={formData.brandCollaboration} onChange={handleChange} disabled={!isVerified} />
                    </Grid>

                    {/* Contact Information */}
                    <Grid item xs={12}>
                        <Typography variant="h6" sx={{ color: '#5386e4', mb: 2, mt: 2 }}>
                            Contact Information
                        </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Instagram Profile Link" placeholder='Ex: https://www.instagram.com/cavinkareindia/' name="instagramLink" value={formData.instagramLink} onChange={handleChange} error={!!errors.instagramLink} helperText={errors.instagramLink} disabled={!isVerified} />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="YouTube Profile Link" name="youtubeLink" placeholder='Ex: https://www.youtube.com/@CavinKareIndia' value={formData.youtubeLink} onChange={handleChange} error={!!errors.youtubeLink} helperText={errors.youtubeLink} disabled={!isVerified} />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Contact Number" name="contactNumber" value={formData.contactNumber} onChange={handleChange} error={!!errors.contactNumber} helperText={errors.contactNumber} disabled={!isVerified} />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField fullWidth label="Complete Address" name="address" multiline rows={3} value={formData.address} onChange={handleChange} error={!!errors.address} helperText={errors.address} disabled={!isVerified} />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                        <TextField fullWidth label="Pincode" name="pincode" value={formData.pincode} onChange={handleChange} error={!!errors.pincode} helperText={errors.pincode} disabled={!isVerified} />
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
                                        <TextField fullWidth label="Reels + Story + Digital Rights Cost" name="reelCost" type="number" value={formData.reelCost} onChange={handleChange} error={!!errors.reelCost} helperText={errors.reelCost} disabled={!isVerified} />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField fullWidth label="Last 10 Reels Views" name="last10ReelsViews" type="number" value={formData.last10ReelsViews} onChange={handleChange} error={!!errors.last10ReelsViews} helperText={errors.last10ReelsViews} disabled={!isVerified} />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField fullWidth label="Last 10 Reels Reach" name="last10ReelsReach" type="number" value={formData.last10ReelsReach} onChange={handleChange} error={!!errors.last10ReelsReach} helperText={errors.last10ReelsReach} disabled={!isVerified} />
                                    </Grid>
                                </>
                            )}

                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Instagram Followers" name="instagramFollowers" type="number" value={formData.instagramFollowers} onChange={handleChange} error={!!errors.instagramFollowers} helperText={errors.instagramFollowers} disabled={!isVerified} />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Instagram Likes" name="instagramLikes" type="number" value={formData.instagramLikes} onChange={handleChange} error={!!errors.instagramLikes} helperText={errors.instagramLikes} disabled={!isVerified} />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Instagram Comments" name="instagramComments" type="number" value={formData.instagramComments} onChange={handleChange} error={!!errors.instagramComments} helperText={errors.instagramComments} disabled={!isVerified} />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Instagram Saves" name="instagramSaves" type="number" value={formData.instagramSaves} onChange={handleChange} error={!!errors.instagramSaves} helperText={errors.instagramSaves} disabled={!isVerified} />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Instagram Shares" name="instagramShares" type="number" value={formData.instagramShares} onChange={handleChange} error={!!errors.instagramShares} helperText={errors.instagramShares} disabled={!isVerified} />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Instagram Reposts" name="instagramReposts" type="number" value={formData.instagramReposts} onChange={handleChange} error={!!errors.instagramReposts} helperText={errors.instagramReposts} disabled={!isVerified} />
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
                                        <TextField fullWidth label="YouTube Video Cost" name="youtubeVideoCost" type="number" value={formData.youtubeVideoCost} onChange={handleChange} error={!!errors.youtubeVideoCost} helperText={errors.youtubeVideoCost} disabled={!isVerified} />
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <TextField fullWidth label="YouTube Shorts Cost" name="youtubeShortsCost" type="number" value={formData.youtubeShortsCost} onChange={handleChange} error={!!errors.youtubeShortsCost} helperText={errors.youtubeShortsCost} disabled={!isVerified} />
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <TextField fullWidth label="Last 10 Shorts Views" name="last10ShortsViews" type="number" value={formData.last10ShortsViews} onChange={handleChange} error={!!errors.last10ShortsViews} helperText={errors.last10ShortsViews} disabled={!isVerified} />
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <TextField fullWidth label="Last 10 Shorts Reach" name="last10ShortsReach" type="number" value={formData.last10ShortsReach} onChange={handleChange} error={!!errors.last10ShortsReach} helperText={errors.last10ShortsReach} disabled={!isVerified} />
                                    </Grid>
                                </>
                            )}

                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="YouTube Followers" name="youtubeFollowers" type="number" value={formData.youtubeFollowers} onChange={handleChange} error={!!errors.youtubeFollowers} helperText={errors.youtubeFollowers} disabled={!isVerified} />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="YouTube Likes" name="youtubeLikes" type="number" value={formData.youtubeLikes} onChange={handleChange} error={!!errors.youtubeLikes} helperText={errors.youtubeLikes} disabled={!isVerified} />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="YouTube Comments" name="youtubeComments" type="number" value={formData.youtubeComments} onChange={handleChange} error={!!errors.youtubeComments} helperText={errors.youtubeComments} disabled={!isVerified} />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="YouTube Saves" name="youtubeSaves" type="number" value={formData.youtubeSaves} onChange={handleChange} error={!!errors.youtubeSaves} helperText={errors.youtubeSaves} disabled={!isVerified} />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="YouTube Shares" name="youtubeShares" type="number" value={formData.youtubeShares} onChange={handleChange} error={!!errors.youtubeShares} helperText={errors.youtubeShares} disabled={!isVerified} />
                            </Grid>
                        </>
                    )}

                    {/* File Uploads */}
                    <Grid item xs={12}>
                        <Typography variant="h6" sx={{ color: '#5386e4', mb: 2, mt: 2 }}>
                            Document Uploads
                        </Typography>
                    </Grid>

                    {formData.socialMediaPlatforms.includes('instagram') && (
                        <>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="body2" sx={{ mb: 1 }}>Instagram Gender Screenshot</Typography>
                                <TextField
                                    fullWidth
                                    type="file"
                                    name="instagramGenderScreenshot"
                                    onChange={handleChange}
                                    inputProps={{ accept: 'image/jpeg,image/jpg,image/png,application/pdf' }}
                                    error={!!errors.instagramGenderScreenshot}
                                    disabled={!isVerified}
                                    helperText="Max 5MB, JPG/PNG/PDF only"
                                />
                                {errors.instagramGenderScreenshot && <Typography color="error" variant="caption" sx={{ display: 'block', mt: 1 }}>{errors.instagramGenderScreenshot}</Typography>}

                                <Button
                                    variant="contained"
                                    sx={{ bgcolor: '#5386e4' }}
                                    onClick={() => window.open(`${process.env.REACT_APP_BASE_URL}/images/gender.jpg`, '_blank')}
                                    sx={{
                                        marginTop: "10px"
                                    }}
                                >
                                    Gender Sample Picture
                                </Button>

                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <Typography variant="body2" sx={{ mb: 1 }}>Instagram Age Screenshot</Typography>
                                <TextField
                                    fullWidth
                                    type="file"
                                    name="instagramAgeScreenshot"
                                    onChange={handleChange}
                                    inputProps={{ accept: 'image/jpeg,image/jpg,image/png,application/pdf' }}
                                    error={!!errors.instagramAgeScreenshot}
                                    disabled={!isVerified}
                                    helperText="Max 5MB, JPG/PNG/PDF only"
                                />
                                {errors.instagramAgeScreenshot && <Typography color="error" variant="caption" sx={{ display: 'block', mt: 1 }}>{errors.instagramAgeScreenshot}</Typography>}
                                <Button
                                    variant="contained"
                                    sx={{ bgcolor: '#5386e4' }}
                                    onClick={() => window.open(`${process.env.REACT_APP_BASE_URL}/images/age.jpg`, '_blank')}
                                    sx={{
                                        marginTop: "10px"
                                    }}
                                >
                                    age Sample Picture
                                </Button>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <Typography variant="body2" sx={{ mb: 1 }}>Instagram Demography Screenshot</Typography>
                                <TextField
                                    fullWidth
                                    type="file"
                                    name="instagramDemographyScreenshot"
                                    onChange={handleChange}
                                    inputProps={{ accept: 'image/jpeg,image/jpg,image/png,application/pdf' }}
                                    error={!!errors.instagramDemographyScreenshot}
                                    disabled={!isVerified}
                                    helperText="Max 5MB, JPG/PNG/PDF only"
                                />
                                {errors.instagramDemographyScreenshot && <Typography color="error" variant="caption" sx={{ display: 'block', mt: 1 }}>{errors.instagramDemographyScreenshot}</Typography>}
                                <Button
                                    variant="contained"
                                    sx={{ bgcolor: '#5386e4' }}
                                    onClick={() => window.open(`${process.env.REACT_APP_BASE_URL}/images/demography.jpg`, '_blank')}
                                    sx={{
                                        marginTop: "10px"
                                    }}
                                >
                                    Demography Sample Picture
                                </Button>
                            </Grid>
                        </>
                    )}

                    {/* Banking Information */}
                    <Grid item xs={12}>
                        <Typography variant="h6" sx={{ color: '#5386e4', mt: 2 }}>
                            Banking Information
                        </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6} sx={{ marginTop: '28px' }}>
                        <TextField fullWidth label="PAN Number" name="panNumber" value={formData.panNumber} onChange={handleChange} error={!!errors.panNumber} helperText={errors.panNumber} disabled={!isVerified} />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Typography variant="body2" sx={{ mb: 1 }}> PAN Card Image </Typography>
                        <TextField
                            fullWidth
                            type="file"
                            name="panCardImage"
                            onChange={handleChange}
                            inputProps={{ accept: 'image/jpeg,image/jpg,image/png,application/pdf' }}
                            error={!!errors.panCardImage}
                            disabled={!isVerified}
                            helperText="Max 5MB, JPG/PNG/PDF only"
                        />
                        {errors.panCardImage && <Typography color="error" variant="caption" sx={{ display: 'block', mt: 1 }}>{errors.panCardImage}</Typography>}
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Bank Account Number" name="bankAccountNumber" value={formData.bankAccountNumber} onChange={handleChange} error={!!errors.bankAccountNumber} helperText={errors.bankAccountNumber} disabled={!isVerified} />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="IFSC Code" name="ifscCode" value={formData.ifscCode} onChange={handleChange} error={!!errors.ifscCode} helperText={errors.ifscCode} disabled={!isVerified} />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Account Holder Name" name="holderName" value={formData.holderName} onChange={handleChange} error={!!errors.holderName} helperText={errors.holderName} disabled={!isVerified} />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField fullWidth label="Bank Name" name="bankName" value={formData.bankName} onChange={handleChange} error={!!errors.bankName} helperText={errors.bankName} disabled={!isVerified} />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Typography variant="body2" sx={{ mb: 1 }}>Bank Passbook Image</Typography>
                        <TextField
                            fullWidth
                            type="file"
                            name="bankPassbookImage"
                            onChange={handleChange}
                            inputProps={{ accept: 'image/jpeg,image/jpg,image/png,application/pdf' }}
                            error={!!errors.bankPassbookImage}
                            disabled={!isVerified}
                            helperText="Max 5MB, JPG/PNG/PDF only"
                        />
                        {errors.bankPassbookImage && <Typography color="error" variant="caption" sx={{ display: 'block', mt: 1 }}>{errors.bankPassbookImage}</Typography>}
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Typography variant="body2" sx={{ mb: 1 }}>GST Certificate - If applicable</Typography>
                        <TextField
                            fullWidth
                            type="file"
                            name="gstCertificate"
                            onChange={handleChange}
                            inputProps={{ accept: 'image/jpeg,image/jpg,image/png,application/pdf' }}
                            disabled={!isVerified}
                            helperText="Max 5MB, JPG/PNG/PDF only"
                        />
                    </Grid>

                    {/* Delivery Address */}
                    <Grid item xs={12}>
                        <Typography variant="body2" sx={{ mb: 1, mt: 2 }}>Product delivery address same as above?</Typography>
                        <RadioGroup row name="deliveryAddressSame" value={formData.deliveryAddressSame} onChange={handleChange}>
                            <FormControlLabel value="yes" control={<Radio disabled={!isVerified} />} label="Yes" />
                            <FormControlLabel value="no" control={<Radio disabled={!isVerified} />} label="No" />
                        </RadioGroup>
                    </Grid>

                    {formData.deliveryAddressSame === 'no' && (
                        <Grid item xs={12}>
                            <TextField fullWidth label="Delivery Address" name="deliveryAddress" multiline rows={3} value={formData.deliveryAddress} onChange={handleChange} disabled={!isVerified} />
                        </Grid>
                    )}

                    <Grid item xs={12}>
                        <TextField fullWidth label="Remarks" name="remarks" multiline rows={3} value={formData.remarks} onChange={handleChange} disabled={!isVerified} />
                    </Grid>

                    <Grid item xs={12}>
                        <FormControlLabel
                            control={<Checkbox name="agreeTerms" checked={formData.agreeTerms} onChange={handleChange} disabled={!isVerified} />}
                            label="I Agree - Acknowledgement on the scope of work (Shared over the email)"
                        />
                        {errors.agreeTerms && <Typography color="error" variant="caption" sx={{ display: 'block', mt: 1 }}>{errors.agreeTerms}</Typography>}
                    </Grid>

                    <Grid item xs={12}>
                        <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            fullWidth
                            disabled={loading || !isVerified}
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

export default InfluencerOnboard;