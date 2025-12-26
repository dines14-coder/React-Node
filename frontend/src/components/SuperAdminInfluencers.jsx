import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    Typography,
    Tabs,
    Tab,
    Card,
    CardContent,
    Input,
    Alert,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemText,
    ListItemButton,
    TextField,
    IconButton
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { CloudUpload, ContentCopy, Email, Visibility, Download, Close } from '@mui/icons-material';
import { uploadExistingInfluencers, getPendingInfluencers, getAssignedInfluencers, getCompletedInfluencers, updateInfluencerStatus, getUsers, bulkAssignInfluencers } from '../services/api';

function TabPanel({ children, value, index }) {
    return (
        <div hidden={value !== index}>
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

function SuperAdminInfluencers({ user }) {
    const navigate = useNavigate();
    const [tabValue, setTabValue] = useState(0);
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [pendingInfluencers, setPendingInfluencers] = useState([]);
    const [assignedInfluencers, setAssignedInfluencers] = useState([]);
    const [completedInfluencers, setCompletedInfluencers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState({ show: false, message: '', severity: 'success' });
    const [selectedRows, setSelectedRows] = useState([]);
    const [pendingSelectedRows, setPendingSelectedRows] = useState([]);
    const [assignedSelectedRows, setAssignedSelectedRows] = useState([]);
    const [completedSelectedRows, setCompletedSelectedRows] = useState([]);
    const [languageFilter, setLanguageFilter] = useState('');
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [users, setUsers] = useState([]);
    const [selectedInfluencerIds, setSelectedInfluencerIds] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [emailModalOpen, setEmailModalOpen] = useState(false);
    const [emailInput, setEmailInput] = useState('');
    const [selectedInfluencerId, setSelectedInfluencerId] = useState('');
    const [showUploadSection, setShowUploadSection] = useState(false);



    const pendingColumns = [
        { field: 'sno', headerName: 'S.No', width: 80 },
        { field: 'username', headerName: 'Username', width: 150 },
        { field: 'businessEmail', headerName: 'Business Email', width: 200 },
        { field: 'name', headerName: 'Name', width: 150 },
        { field: 'profileLink', headerName: 'Profile Link', width: 250 },
        { field: 'market', headerName: 'Market(Language)', width: 150 },
        {
            field: 'actions',
            headerName: 'Assign',
            width: 120,
            renderCell: (params) => (
                <Button
                    size="small"
                    variant="contained"
                    onClick={() => {
                        setSelectedInfluencerIds([params.row.id]);
                        setAssignModalOpen(true);
                    }}
                >
                    Assign
                </Button>
            ),
        },
    ];

    const assignedColumns = [
        { field: 'sno', headerName: 'S.No', width: 80 },
        { field: 'assignedTo', headerName: 'Assigned To', width: 150 },
        { field: 'username', headerName: 'Username', width: 150 },
        { field: 'businessEmail', headerName: 'Business Email', width: 200 },
        { field: 'name', headerName: 'Name', width: 150 },
        { field: 'profileLink', headerName: 'Profile Link', width: 250 },
        { field: 'market', headerName: 'Market(Language)', width: 150 },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 120,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        size="small"
                        variant="contained"
                        onClick={() => {
                            setSelectedInfluencerIds([params.row.id]);
                            setAssignModalOpen(true);
                        }}
                    >
                        Reassign
                    </Button>
                    {/* <Button
                        size="small"
                        variant="contained"
                        color="success"
                        onClick={() => handleStatusChange(params.row.id, 'completed')}
                    >
                        Complete
                    </Button> */}
                </Box>
            ),
        },
    ];

    const completedColumns = [
        { field: 'sno', headerName: 'S.No', width: 80 },
        { field: 'assignedTo', headerName: 'Assigned To', width: 150 },
        { field: 'username', headerName: 'Username', width: 150 },
        { field: 'businessEmail', headerName: 'Business Email', width: 200 },
        { field: 'name', headerName: 'Name', width: 150 },
        { field: 'profileLink', headerName: 'Profile Link', width: 250 },
        { field: 'market', headerName: 'Market(Language)', width: 150 },
        {
            field: 'view',
            headerName: 'View Form',
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

    useEffect(() => {
        fetchAllInfluencers();
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await getUsers();
            const filteredUsers = response.data.filter(user => user.role !== 'superadmin' && user.role !== 'super_admin');
            setUsers(filteredUsers);
        } catch (error) {
            console.error('Fetch users error:', error);
        }
    };

    const fetchAllInfluencers = async () => {
        setLoading(true);
        try {
            const [pendingRes, assignedRes, completedRes] = await Promise.all([
                getPendingInfluencers(),
                getAssignedInfluencers(),
                getCompletedInfluencers()
            ]);

            setPendingInfluencers(pendingRes.data?.data || []);
            setAssignedInfluencers(assignedRes.data?.data || []);
            setCompletedInfluencers(completedRes.data?.data || []);
        } catch (error) {
            console.error('Fetch error:', error);
            showAlert('Failed to fetch influencers', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        validateAndSetFile(selectedFile);
    };

    const validateAndSetFile = (selectedFile) => {
        if (selectedFile && selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
            setFile(selectedFile);
        } else {
            showAlert('Please select a valid Excel file (.xlsx)', 'error');
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const droppedFile = e.dataTransfer.files[0];
        validateAndSetFile(droppedFile);
    };

    const handleUpload = async () => {
        if (!file) {
            showAlert('Please select a file first', 'error');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('excel', file);

        try {
            await uploadExistingInfluencers(formData);
            showAlert('Excel file uploaded successfully', 'success');
            setFile(null);
            fetchAllInfluencers();
        } catch (error) {
            showAlert(' Please fill the mandatory fields: Name, Username, Profile Link for uploading the file.', 'error');
        } finally {
            setUploading(false);
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

    const handleUserAssign = async () => {
        if (!selectedUserId) {
            showAlert('Please select a user', 'error');
            return;
        }
        try {
            if (selectedInfluencerIds.length > 0) {
                console.log('Assigning IDs:', selectedInfluencerIds);
                await bulkAssignInfluencers(selectedInfluencerIds, selectedUserId);
                showAlert(`${selectedInfluencerIds.length} influencer(s) assigned successfully`, 'success');
                clearCurrentSelectedRows();
            }
            setAssignModalOpen(false);
            setSelectedUserId('');
            setSelectedInfluencerIds([]);
            fetchAllInfluencers();
        } catch (error) {
            console.error('Assignment error:', error);
            showAlert('Failed to assign influencer(s)', 'error');
        }
    };

    const showAlert = (message, severity) => {
        setAlert({ show: true, message, severity });
        setTimeout(() => setAlert({ show: false, message: '', severity: 'success' }), 3000);
    };

    const getPendingRows = () => {
        return pendingInfluencers
            .filter(inf => !languageFilter || inf.market === languageFilter)
            .map((inf, index) => ({
                ...inf,
                id: inf._id,
                sno: index + 1,
                businessEmail: inf.businessEmail || '-',
                assignedTo: inf.assignedTo ? (inf.assignedTo.name || inf.assignedTo.username) : '-'
            }));
    };

    const getAssignedRows = () => {
        return assignedInfluencers
            .filter(inf => !languageFilter || inf.market === languageFilter)
            .map((inf, index) => ({
                ...inf,
                id: inf._id,
                sno: index + 1,
                businessEmail: inf.businessEmail || '-',
                assignedTo: inf.assignedTo ? (inf.assignedTo.name || inf.assignedTo.username) : '-'
            }));
    };

    const getCompletedRows = () => {
        return completedInfluencers
            .filter(inf => !languageFilter || inf.market === languageFilter)
            .map((inf, index) => ({
                ...inf,
                id: inf._id,
                sno: index + 1,
                businessEmail: inf.businessEmail || '-',
                assignedTo: inf.assignedTo ? (inf.assignedTo.name || inf.assignedTo.username) : '-'
            }));
    };

    const getUniqueLanguages = () => {
        const allInfluencers = [...pendingInfluencers, ...assignedInfluencers, ...completedInfluencers];
        const languages = allInfluencers
            .map(inf => inf.market)
            .filter(market => market && market !== null)
            .filter((value, index, self) => self.indexOf(value) === index);
        return languages;
    };

    const getCurrentSelectedRows = () => {
        const selected = {
            0: pendingSelectedRows,
            1: assignedSelectedRows,
            2: completedSelectedRows
        }[tabValue] || [];
        // console.log(`Tab ${tabValue} selected rows:`, selected);
        return selected;
    };

    const clearCurrentSelectedRows = () => {
        switch (tabValue) {
            case 0: setPendingSelectedRows([]); break;
            case 1: setAssignedSelectedRows([]); break;
            case 2: setCompletedSelectedRows([]); break;
        }
    };

    const handleCopyId = (id) => {
        navigator.clipboard.writeText(id);
        showAlert('ID copied to clipboard', 'success');
    };

    const handleSendEmailClick = (id) => {
        setSelectedInfluencerId(id);
        setEmailInput('');
        setEmailModalOpen(true);
    };

    const handleSendEmail = async () => {
        if (!emailInput.trim()) {
            showAlert('Please enter an email address', 'error');
            return;
        }
        try {
            const { default: api } = await import('../services/api');
            const formUrl = `${window.location.origin}/form/${user?.id}/0/${selectedInfluencerId}`;
            await api.post('/send-form-email', { email: emailInput, formUrl: formUrl });
            showAlert('Email sent successfully', 'success');
            setEmailModalOpen(false);
            setEmailInput('');
            setSelectedInfluencerId('');
        } catch (error) {
            showAlert('Failed to send email', 'error');
        }
    };

    const handleViewForm = (influencerFormId) => {
        if (influencerFormId) {
            window.open(`${window.location.origin}/#/influencer/${influencerFormId}`, '_blank');
        }
    };

    const handleDownloadSample = () => {
        try {
            const link = document.createElement('a');
            link.href = `${process.env.REACT_APP_BASE_URL}/Bulk Upload Format.xlsx`;
            link.download = 'Bulk Upload Format.xlsx';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Failed to download sample format:', error);
            showAlert('Failed to download sample format', 'error');
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Existing Influencers
                </Typography>
                <Button
                    variant="outlined"
                    startIcon={<CloudUpload />}
                    onClick={() => setShowUploadSection(!showUploadSection)}
                    sx={{ color: '#5386e4', borderColor: '#5386e4' }}
                >
                    Upload Excel
                </Button>
            </Box>

            {alert.show && (
                <Alert severity={alert.severity} sx={{ mb: 2 }}>
                    {alert.message}
                </Alert>
            )}

            {showUploadSection && (
                <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">
                            Upload Excel File
                        </Typography>
                        <IconButton 
                            onClick={() => setShowUploadSection(false)}
                            sx={{ color: '#5386e4' }}
                        >
                            <Close />
                        </IconButton>
                    </Box>
                    <Box
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        sx={{
                            border: `2px dashed ${dragOver ? '#5386e4' : '#ccc'}`,
                            borderRadius: 2,
                            p: 4,
                            textAlign: 'center',
                            bgcolor: dragOver ? '#f0f7ff' : '#fafafa',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            mb: 2
                        }}
                        onClick={() => document.getElementById('file-input').click()}
                    >
                        <CloudUpload sx={{ fontSize: 48, color: '#5386e4', mb: 2 }} />
                        <Typography variant="h6" sx={{ mb: 1 }}>
                            {file ? file.name : 'Drag & Drop Excel File Here'}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            or click to browse files
                        </Typography>
                        <input
                            id="file-input"
                            type="file"
                            accept=".xlsx"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                        />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                        <Button
                            variant="contained"
                            startIcon={<CloudUpload />}
                            onClick={handleUpload}
                            disabled={!file || uploading}
                        >
                            {uploading ? 'Uploading...' : 'Upload'}
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<Download />}
                            onClick={handleDownloadSample}
                        >
                            Sample Format
                        </Button>
                        {file && (
                            <Button
                                variant="outlined"
                                onClick={() => setFile(null)}
                            >
                                Clear
                            </Button>
                        )}
                    </Box>
                </CardContent>
                </Card>
            )}

            <Card>
                <CardContent>
                    <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'space-between' }}>
                        <FormControl size="small" sx={{ minWidth: 200 }}>
                            <InputLabel>Filter by Language</InputLabel>
                            <Select
                                value={languageFilter}
                                label="Filter by Language"
                                onChange={(e) => setLanguageFilter(e.target.value)}
                            >
                                <MenuItem value="">All Languages</MenuItem>
                                {getUniqueLanguages().map((language) => (
                                    <MenuItem key={language} value={language}>
                                        {language}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <Button
                            variant="contained"
                            disabled={getCurrentSelectedRows().length === 0}
                            onClick={() => {
                                setSelectedInfluencerIds(getCurrentSelectedRows());
                                setAssignModalOpen(true);
                            }}
                        >
                            Assign Selected {getCurrentSelectedRows().length > 0 ? `(${getCurrentSelectedRows().length})` : ''}
                        </Button>
                    </Box>
                    <Tabs value={tabValue} onChange={(e, newValue) => {
                        setPendingSelectedRows([]);
                        setAssignedSelectedRows([]);
                        setCompletedSelectedRows([]);
                        setTabValue(newValue);
                    }}>
                        <Tab label={`Pending (${getPendingRows().length})`} />
                        <Tab label={`Assigned (${getAssignedRows().length})`} />
                        <Tab label={`Completed (${getCompletedRows().length})`} />
                    </Tabs>

                    <TabPanel value={tabValue} index={0}>
                        <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
                            {/* <Button
                                variant="contained"
                                disabled={pendingSelectedRows.length === 0}
                                onClick={() => {
                                    setSelectedInfluencerIds(pendingSelectedRows);
                                    setAssignModalOpen(true);
                                }}
                            >
                                Assign Selected {pendingSelectedRows.length > 0 ? `(${pendingSelectedRows.length})` : ''}
                            </Button> */}
                        </Box>
                        <DataGrid
                            rows={getPendingRows()}
                            columns={pendingColumns}
                            pageSize={10}
                            loading={loading}
                            autoHeight
                            checkboxSelection
                            getRowId={(row) => row.id}
                            rowSelectionModel={pendingSelectedRows}
                            onSelectionModelChange={(selection) => {
                                console.log("Selected Row IDs:", selection);
                                setPendingSelectedRows(selection);
                            }}
                        />
                    </TabPanel>

                    <TabPanel value={tabValue} index={1}>
                        <DataGrid
                            rows={getAssignedRows()}
                            columns={assignedColumns}
                            pageSize={10}
                            loading={loading}
                            autoHeight
                            checkboxSelection
                            onRowSelectionModelChange={(newSelection) => {
                                console.log('Assigned selection changed:', newSelection);
                                setAssignedSelectedRows(newSelection);
                            }}
                            rowSelectionModel={assignedSelectedRows}
                            getRowId={(row) => row.id}
                        />
                    </TabPanel>

                    <TabPanel value={tabValue} index={2}>
                        <DataGrid
                            rows={getCompletedRows()}
                            columns={completedColumns}
                            pageSize={10}
                            loading={loading}
                            autoHeight
                            // checkboxSelection
                            onRowSelectionModelChange={(newSelection) => {
                                console.log('Completed selection changed:', newSelection);
                                setCompletedSelectedRows(newSelection);
                            }}
                            rowSelectionModel={completedSelectedRows}
                            getRowId={(row) => row.id}
                        />
                    </TabPanel>
                </CardContent>
            </Card>

            <Dialog open={assignModalOpen} onClose={() => setAssignModalOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {selectedInfluencerIds.length > 0 ? `Assign ${selectedInfluencerIds.length} to User` : `Assign ${getCurrentSelectedRows().length} Selected to User`}
                </DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <FormControl fullWidth>
                        <InputLabel>Select User</InputLabel>
                        <Select
                            value={selectedUserId}
                            label="Select User"
                            onChange={(e) => setSelectedUserId(e.target.value)}
                        >
                            {users.map((user) => (
                                <MenuItem key={user._id} value={user._id}>
                                    {user.name || user.username} - {user.email}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAssignModalOpen(false)}>Cancel</Button>
                    <Button onClick={handleUserAssign} variant="contained">Assign</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={emailModalOpen} onClose={() => setEmailModalOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Send Email</DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <TextField
                        fullWidth
                        label="Email Address"
                        type="email"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="Enter email address"
                        multiline
                        rows={4}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEmailModalOpen(false)}>Cancel</Button>
                    <Button onClick={handleSendEmail} variant="contained">Send</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default SuperAdminInfluencers;