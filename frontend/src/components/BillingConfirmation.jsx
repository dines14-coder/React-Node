import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    TextField,
    Radio,
    RadioGroup,
    FormControlLabel,
    FormControl,
    Switch
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { ArrowBack } from '@mui/icons-material';
import { getCampaignApprovedInfluencers, updateBillingConfirmation } from '../services/api';
import { toast } from 'react-toastify';

function BillingConfirmation() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [rows, setRows] = useState([]);

    useEffect(() => {
        fetchApprovedInfluencers();
    }, []);

    const fetchApprovedInfluencers = async () => {
        setLoading(true);
        try {
            const response = await getCampaignApprovedInfluencers(id);
            const data = response.data.data || [];
            setRows(data.map(inf => ({
                ...inf,
                id: inf._id,
                billingSent: '',
                billingNumber: '',
                verified: false
            })));
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch approved influencers');
        } finally {
            setLoading(false);
        }
    };

    const handleRadioChange = (rowId, value) => {
        setRows(prevRows => prevRows.map(row =>
            row._id === rowId ? { ...row, billingSent: value } : row
        ));
    };

    const handleInputChange = (rowId, value) => {
        setRows(prevRows => prevRows.map(row =>
            row._id === rowId ? { ...row, billingNumber: value } : row
        ));
    };

    const handleSwitchChange = (rowId, value) => {
        setRows(prevRows => prevRows.map(row =>
            row._id === rowId ? { ...row, verified: value } : row
        ));
    };

    const handleSubmit = async () => {
        try {
            const billingData = rows.map(row => ({
                influencerId: row._id,
                billingSent: row.billingSent === 'yes' ? 1 : 0,
                billingNumber: parseInt(row.billingNumber) || 0,
                billingVerified: row.verified ? 1 : 0
            }));

            await updateBillingConfirmation(id, { billingData, stageStatus: 17 });
            toast.success('Billing details updated successfully');
            navigate(`/marketing/edit/${id}`);
        } catch (error) {
            console.error(error);
            toast.error('Failed to update billing details');
        }
    };

    const columns = [
        {
            field: 'sno',
            headerName: 'S.No',
            width: 70,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => {
                const index = rows.findIndex(row => row._id === params.row._id);
                return index + 1;
            }
        },
        {
            field: 'name',
            headerName: 'Influencer Name',
            width: 250,
            renderCell: (params) => (
                <Typography variant="body2" fontWeight="medium">{params.value}</Typography>
            )
        },
        {
            field: 'billingSent',
            headerName: 'Billing Sent?',
            width: 200,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <FormControl component="fieldset" fullWidth>
                    <RadioGroup
                        row
                        value={params.value}
                        onChange={(e) => handleRadioChange(params.row._id, e.target.value)}
                        sx={{ justifyContent: 'center' }}
                    >
                        <FormControlLabel
                            value="yes"
                            control={<Radio size="small" />}
                            label="Y"
                            sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.875rem' } }}
                        />
                        <FormControlLabel
                            value="no"
                            control={<Radio size="small" />}
                            label="N"
                            sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.875rem' } }}
                        />
                    </RadioGroup>
                </FormControl>
            )
        },
        {
            field: 'billingNumber',
            headerName: 'Billing number',
            width: 250,
            renderCell: (params) => (
                <TextField
                    size="small"
                    fullWidth
                    value={params.value}
                    onChange={(e) => handleInputChange(params.row._id, e.target.value)}
                    sx={{
                        bgcolor: 'white',
                        '& .MuiOutlinedInput-root': { borderRadius: 1 }
                    }}
                />
            )
        },
        {
            field: 'verified',
            headerName: 'Billing Verified',
            width: 200,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <Switch
                    checked={params.value}
                    onChange={(e) => handleSwitchChange(params.row._id, e.target.checked)}
                    color="primary"
                />
            )
        }
    ];

    return (
        <Box sx={{ p: 4, bgcolor: '#f8fafc', minHeight: '100vh' }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate(`/marketing/edit/${id}`)}
                    sx={{ mb: 2, color: 'text.secondary' }}
                >
                    Back
                </Button>
                <Typography variant="h5" fontWeight="bold" sx={{ color: '#1a1a1a' }}>
                    Billing Confirmation
                </Typography>
            </Box>

            <Card sx={{ boxShadow: '0 2px 10px rgba(0,0,0,0.05)', borderRadius: 2 }}>
                <CardContent sx={{ p: 0 }}>
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        getRowId={(row) => row._id}
                        autoHeight
                        disableSelectionOnClick
                        hideFooter
                        loading={loading}
                        rowHeight={60}
                        sx={{
                            border: 'none',
                            '& .MuiDataGrid-columnHeaders': {
                                backgroundColor: '#f8f9fa',
                                color: '#666',
                                fontSize: '13px',
                                textTransform: 'uppercase',
                                borderBottom: '1px solid #e0e0e0',
                                fontWeight: 600
                            },
                            '& .MuiDataGrid-cell': {
                                borderBottom: '1px solid #f0f0f0',
                                py: 1
                            },
                            '& .MuiDataGrid-row:hover': {
                                backgroundColor: '#fafafa'
                            }
                        }}
                    />
                </CardContent>
            </Card>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                    sx={{ px: 4, py: 1 }}
                >
                    Submit
                </Button>
            </Box>
        </Box>
    );
}

export default BillingConfirmation;
