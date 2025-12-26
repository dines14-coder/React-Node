import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Typography,
    Card,
    CardContent,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { getAssignedInfluencers, getCompletedInfluencers, updateInfluencerStatus } from '../services/api';
import { ContentCopy, Email, Visibility } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

function TabPanel({ children, value, index }) {
    return (
        <div hidden={value !== index}>
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

function AdminInfluencers({ user }) {
    const [tabValue, setTabValue] = useState(0);
    const [assignedInfluencers, setAssignedInfluencers] = useState([]);
    const [completedInfluencers, setCompletedInfluencers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState({ show: false, message: '', severity: 'success' });
    const [assignedSelectedRows, setAssignedSelectedRows] = useState([]);
    const [completedSelectedRows, setCompletedSelectedRows] = useState([]);
    const [emailModalOpen, setEmailModalOpen] = useState(false);
    const [emailAddress, setEmailAddress] = useState('');
    const [emailSending, setEmailSending] = useState(false);
    const [selectedInfluencerId, setSelectedInfluencerId] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchAllInfluencers();
    }, []);

    const fetchAllInfluencers = async () => {
        setLoading(true);
        try {
            const [assignedRes, completedRes] = await Promise.all([
                getAssignedInfluencers(),
                getCompletedInfluencers()
            ]);

            setAssignedInfluencers(assignedRes.data?.data || []);
            setCompletedInfluencers(completedRes.data?.data || []);
        } catch (error) {
            console.error('Fetch error:', error);
            showAlert('Failed to fetch influencers', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            await updateInfluencerStatus(id, newStatus);
            showAlert(`Status updated to ${newStatus}`, 'success');
            fetchAllInfluencers();
        } catch (error) {
            showAlert('Failed to update status', 'error');
        }
    };

    const showAlert = (message, severity) => {
        setAlert({ show: true, message, severity });
        setTimeout(() => setAlert({ show: false, message: '', severity: 'success' }), 3000);
    };

    const handleCopyUrl = (rowId) => {
        const url = `${process.env.REACT_APP_BASE_URL}/#/form/${user?.id}/1/${rowId}`;
        navigator.clipboard.writeText(url);
        toast.success('URL copied to clipboard!');
    };

    const handleSendEmailClick = (rowId) => {
        setSelectedInfluencerId(rowId);
        setEmailAddress('');
        setEmailModalOpen(true);
    };

    const handleSendEmail = async () => {
        if (!emailAddress.trim()) {
            toast.error('Please enter an email address');
            return;
        }
        setEmailSending(true);
        try {
            const { default: api } = await import('../services/api');
            const formUrl = `${process.env.REACT_APP_BASE_URL}/#/form/${user?.id}/0/${selectedInfluencerId}`;
            await api.post('/send-form-email', { email: emailAddress, formUrl: formUrl });
            setEmailModalOpen(false);
            setEmailAddress('');
            setSelectedInfluencerId('');
            toast.success('Email sent successfully!');
        } catch (error) {
            toast.error('Failed to send email');
        } finally {
            setEmailSending(false);
        }
    };

    const handleViewForm = (influencerFormId) => {
        if (influencerFormId) {
            window.open(`/influencer/${influencerFormId}`, '_blank');
        }
    };

    const getAssignedRows = () => {
        return assignedInfluencers.map((inf, index) => ({
            ...inf,
            id: inf._id,
            sno: index + 1,
            businessEmail: inf.businessEmail || '-',
            assignedTo: inf.assignedTo ? (inf.assignedTo.name || inf.assignedTo.username) : '-'
        }));
    };

    const getCompletedRows = () => {
        return completedInfluencers.map((inf, index) => ({
            ...inf,
            id: inf._id,
            sno: index + 1,
            businessEmail: inf.businessEmail || '-',
            assignedTo: inf.assignedTo ? (inf.assignedTo.name || inf.assignedTo.username) : '-'
        }));
    };

    const assignedColumns = [
        { field: 'sno', headerName: 'S.No', width: 80 },
        { field: 'username', headerName: 'Username', width: 150 },
        { field: 'businessEmail', headerName: 'Business Email', width: 200 },
        { field: 'name', headerName: 'Name', width: 150 },
        { field: 'profileLink', headerName: 'Profile Link', width: 250 },
        { field: 'market', headerName: 'Market(Language)', width: 150 },
        { field: 'assignedTo', headerName: 'Assigned To', width: 150 },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 200,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        size="small"
                        startIcon={<ContentCopy />}
                        onClick={() => handleCopyUrl(params.row.id)}
                    >
                        Copy
                    </Button>
                    <Button
                        size="small"
                        startIcon={<Email />}
                        onClick={() => handleSendEmailClick(params.row.id)}
                    > Email
                    </Button>
                </Box>
            ),
        },
    ];

    const completedColumns = [
        { field: 'sno', headerName: 'S.No', width: 80 },
        { field: 'username', headerName: 'Username', width: 150 },
        { field: 'businessEmail', headerName: 'Business Email', width: 200 },
        { field: 'name', headerName: 'Name', width: 150 },
        { field: 'profileLink', headerName: 'Profile Link', width: 250 },
        { field: 'market', headerName: 'Market(Language)', width: 150 },
        { field: 'assignedTo', headerName: 'Assigned To', width: 150 },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 120,
            renderCell: (params) => (
                <Button
                    size="small"
                    variant="contained"
                    startIcon={<Visibility />}
                    onClick={() => navigate(`/influencer/${params.row.influencerFormId}`)}
                    disabled={!params.row.influencerFormId}
                >
                    View
                </Button>
            ),
        },
    ];

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                My Influencers
            </Typography>

            {alert.show && (
                <Alert severity={alert.severity} sx={{ mb: 2 }}>
                    {alert.message}
                </Alert>
            )}

            <Card>
                <CardContent>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button
                                variant={tabValue === 0 ? 'contained' : 'text'}
                                onClick={() => setTabValue(0)}
                            >
                                Assigned ({getAssignedRows().length})
                            </Button>
                            <Button
                                variant={tabValue === 1 ? 'contained' : 'text'}
                                onClick={() => setTabValue(1)}
                            >
                                Completed ({getCompletedRows().length})
                            </Button>
                        </Box>
                    </Box>

                    <TabPanel value={tabValue} index={0}>
                        <DataGrid
                            rows={getAssignedRows()}
                            columns={assignedColumns}
                            pageSize={10}
                            loading={loading}
                            autoHeight
                            getRowId={(row) => row.id}
                        />
                    </TabPanel>

                    <TabPanel value={tabValue} index={1}>
                        <DataGrid
                            rows={getCompletedRows()}
                            columns={completedColumns}
                            pageSize={10}
                            loading={loading}
                            autoHeight
                            getRowId={(row) => row.id}
                        />
                    </TabPanel>
                </CardContent>
            </Card>

            <Dialog open={emailModalOpen} onClose={() => setEmailModalOpen(false)} maxWidth="sm" fullWidth>
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

export default AdminInfluencers;
