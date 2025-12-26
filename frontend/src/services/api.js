import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && error.response?.data?.error === 'Invalid token.') {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
    }
    return Promise.reject(error);
  }
);

export const healthCheck = () => api.get('/health');
export const login = (credentials) => api.post('/login', credentials);
export const changePassword = (passwordData) => api.post('/change-password', passwordData);
export const getUsers = () => api.get('/users');
export const createUser = (data) => api.post('/users', data);
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/users/${id}`);
export const onboardInfluencer = (data) => api.post('/influencers/onboard', data);
export const onboardInfluencerWithFiles = (formData) => api.post('/influencers/onboard', formData, {
  headers: {
    'Content-Type': 'multipart/form-data'
  }
});
export const getInfluencers = () => api.get('/influencers');
export const exportInfluencers = () => api.get('/influencers/export', { responseType: 'blob' });
export const exportFilteredInfluencers = (filters) => api.post('/influencers/export/filtered', filters, { responseType: 'blob' });
export const getNegotiationPending = () => api.get('/negotiation/pending');
export const getNegotiationCompleted = () => api.get('/negotiation/completed');
export const exportNegotiationPending = () => api.get('/negotiation/export/pending', { responseType: 'blob' });
export const exportNegotiationCompleted = () => api.get('/negotiation/export/completed', { responseType: 'blob' });
export const uploadExistingInfluencers = (formData) => api.post('/existing-influencers/upload', formData, {
  headers: {
    'Content-Type': 'multipart/form-data'
  }
});
export const getExistingInfluencers = () => api.get('/existing-influencers');
export const getPendingInfluencers = () => api.get('/existing-influencers/pending');
export const getAssignedInfluencers = () => api.get('/existing-influencers/assigned');
export const getCompletedInfluencers = () => api.get('/existing-influencers/completed');
export const updateInfluencerStatus = (id, status, assignedTo = null, influencerFormId = null) => api.patch(`/existing-influencers/${id}/status`, { status, assignedTo, influencerFormId });
export const bulkAssignInfluencers = (ids, assignedTo) => api.patch('/existing-influencers/bulk-assign', { ids, assignedTo });
export const getExistingInfluencerById = (id) => api.get(`/existing-influencers/${id}`);
export const getBarterInfluencers = () => api.get('/influencers/barter');
export const sendOtp = (mobileNumber, otp) => api.post('/send-otp', { mobileNumber, otp });

// Marketing API endpoints
export const createMarketing = (formData) => api.post('/marketing', formData, {
  headers: {
    'Content-Type': 'multipart/form-data'
  }
});
export const getAllMarketing = () => api.get('/marketing');
export const getMarketingById = (id) => api.get(`/marketing/${id}`);
export const updateMarketing = (id, formData) => api.put(`/marketing/${id}`, formData, {
  headers: {
    'Content-Type': 'multipart/form-data'
  }
});
export const updateMarketingStatus = (id, status) => api.patch(`/marketing/${id}/status`, { status });
export const deleteMarketing = (id) => api.delete(`/marketing/${id}`);


// campaign API endpoints
export const createCampaign = (data) => api.post('/campaign', data);
export const getAllCampaign = () => api.get('/campaign');
export const getCampaignById = (id) => api.get(`/campaign/${id}`);
export const getCampaignInfluencers = (id) => api.get(`/campaign/${id}/influencers`);
export const getCampaignShortlistedInfluencers = (id) => api.get(`/campaign/${id}/shortlisted-influencers`);
export const getCampaignApprovedInfluencers = (id) => api.get(`/campaign/${id}/approved-influencers`);
export const updateInfluencerEmpanelment = (id, data) => api.put(`/campaign/${id}/empanelment`, data);
export const updateBudgetRelease = (id, data) => api.put(`/campaign/${id}/budget-release`, data);
export const updatePODispatch = (id, data) => api.put(`/campaign/${id}/po-dispatch`, data);
export const updateProductRequirement = (id, data) => api.put(`/campaign/${id}/product-requirement`, data);
export const updateContentCoordination = (id, data) => api.put(`/campaign/${id}/content-coordination`, data);
export const updateLogisticsTracking = (id, data) => api.put(`/campaign/${id}/logistics-tracking`, data);
export const updateContentSection = (id, data) => api.put(`/campaign/${id}/content-section`, data);
export const updateAssetCollection = (id, data) => api.put(`/campaign/${id}/asset-collection`, data);
export const updateBillingConfirmation = (id, data) => api.put(`/campaign/${id}/billing-confirmation`, data);
export const updateInfluencerFinalCosts = (id, data) => api.put(`/campaign/${id}/final-costs`, data);
export const updateCampaignById = (id, formData) => api.put(`/campaign/${id}`, formData, {
  headers: {
    'Content-Type': 'multipart/form-data'
  }
});


// Masters API endpoints
export const createBrand = (data) => api.post('/brands', data);
export const getBrands = () => api.get('/brands');
export const updateBrand = (id, data) => api.put(`/brands/${id}`, data);
export const deleteBrand = (id) => api.delete(`/brands/${id}`);

export const createProduct = (data) => api.post('/products', data);
export const getProducts = () => api.get('/products');
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);

export const createCampaignStage = (data) => api.post('/campaign-stages', data);
export const getCampaignStages = () => api.get('/campaign-stages');
export const updateCampaignStage = (id, data) => api.put(`/campaign-stages/${id}`, data);
export const deleteCampaignStage = (id) => api.delete(`/campaign-stages/${id}`);

export default api;
