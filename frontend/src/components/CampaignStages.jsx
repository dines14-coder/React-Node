import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, IconButton, Chip } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { ArrowBack, Edit } from '@mui/icons-material';
import { getCampaignStages, getMarketingById, getCampaignById } from '../services/api';
import { toast } from 'react-toastify';

function CampaignStages() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [campaign, setCampaign] = useState(null);
    const [stages, setStages] = useState([]);

    useEffect(() => {
        fetchCampaignDetails();
        fetchStages();
    }, [id]);

    const fetchCampaignDetails = async () => {
        try {
            const res = await getCampaignById(id);
            setCampaign(res.data.data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch campaign details');
        }
    };

    const fetchStages = async () => {
        try {
            const res = await getCampaignStages();
            setStages(res.data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch stages');
        }
    };

    const stageColumns = [
        { field: 'sno', headerName: 'S.No', width: 80, pinnable: false },
        { field: 'stageName', headerName: 'Stage Name', width: 250, pinnable: false },
        { field: 'stakeholders', headerName: 'Stakeholders', width: 200 },
        { field: 'ackFrom', headerName: 'Ack From', width: 200 },
        { field: 'workflowType', headerName: 'Workflow Type', width: 150 },
        {
            field: 'sla',
            headerName: 'SLA',
            width: 150,
            valueFormatter: (params) => {
                if (!params.value) return '-';
                return `${params.value} Days`;
            }
        },
        {
            field: 'status',
            headerName: 'Status',
            width: 150,
            renderCell: (params) => {
                const stageStatus = campaign?.stageStatus || 1;
                const currentRow = params.row.sno;

                let status = 'Pending';
                // let color = 'warning';

                let color = 'default';
                let bgcolor = '#f5f5f5';
                let textColor = '#666';

                if (campaign?.strategyRejectedRemarks && params.row.stageName == 'Startegy approval') {
                    status = 'Rejected';
                    color = 'error';
                } else if (currentRow < stageStatus) {
                    status = 'Completed';
                    bgcolor = '#e8f5e9';
                    textColor = '#2e7d32';
                } else if (currentRow === stageStatus) {
                    status = 'In Progress';
                    bgcolor = '#e3f2fd';
                    textColor = '#1976d2';
                }

                return (
                    <Chip
                        label={status}
                        size="small"
                        sx={{
                            bgcolor: bgcolor,
                            color: textColor,
                            fontWeight: 500
                        }}
                    />
                );
            }
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 150,
            renderCell: (params) => {
                const stageStatus = campaign?.stageStatus || 1;
                const currentRow = params.row.sno;
                const isRejected = campaign?.strategyRejectedRemarks;
                const isInProgress = currentRow === stageStatus && !isRejected;

                return (
                    <IconButton
                        size="small"
                        disabled={!isInProgress || isRejected}
                        onClick={() => {
                            if (!isInProgress) return;

                            const isStrategy = params.row.stageName === 'Strategy' || params.row.sno === 2;
                            const isApproval = params.row.stageName === 'Strategy Approval' || params.row.sno === 3;
                            const isPlanning = params.row.stageName === 'Influencer Planning' || params.row.sno === 4;
                            const isShortlisting = params.row.stageName === 'Influencer Shortlisting' || params.row.stageName === 'Shortlisting' || params.row.sno === 5;
                            const isBusinessApproval = params.row.stageName === 'Business Approval' || params.row.sno === 6;
                            const isFinalCosts = params.row.stageName === 'Influencer Final Costs' || params.row.stageName === 'Final Costs' || params.row.sno === 7;
                            const isEmpanelment = params.row.stageName === 'Influencer Empanelment' || params.row.sno === 8;
                            const isBudgetRelease = params.row.stageName === 'Budget Release' || params.row.sno === 9;
                            const isPODispatch = params.row.stageName === 'PO to Influencer' || params.row.stageName === 'PO Dispatch' || params.row.sno === 10;
                            const isProductRequirement = params.row.stageName === 'Product Requirement' || params.row.stageName === 'Product requirement' || params.row.sno === 11;
                            const isContentCoordination = params.row.stageName === 'Content Coordination' || params.row.sno === 12;
                            const isLogistics = params.row.stageName === 'Logistics Team' || params.row.sno === 13;
                            const isContentLive = params.row.stageName === 'Content & Video Live' || params.row.sno === 14;
                            const isAssetCollection = params.row.stageName === 'Asset Collection' || params.row.sno === 15;
                            const isBillingCoordination = params.row.stageName === 'Billing Coordination' || params.row.stageName === 'Billing Confirmation' || params.row.sno === 16;

                            let route = `/marketing/edit/${id}/stage/${params.row._id}`;
                            if (isStrategy) route = `/marketing/edit/${id}/strategy/${params.row._id}`;
                            if (isApproval) route = `/marketing/edit/${id}/approval/${params.row._id}`;
                            if (isPlanning) route = `/marketing/edit/${id}/planning/${params.row._id}`;
                            if (isShortlisting) route = `/marketing/edit/${id}/shortlisting/${params.row._id}`;
                            if (isBusinessApproval) route = `/marketing/edit/${id}/business-approval/${params.row._id}`;
                            if (isFinalCosts) route = `/marketing/edit/${id}/final-costs/${params.row._id}`;
                            if (isEmpanelment) route = `/marketing/edit/${id}/empanelment/${params.row._id}`;
                            if (isBudgetRelease) route = `/marketing/edit/${id}/budget-release/${params.row._id}`;
                            if (isPODispatch) route = `/marketing/edit/${id}/po-dispatch/${params.row._id}`;
                            if (isProductRequirement) route = `/marketing/edit/${id}/product-requirement/${params.row._id}`;
                            if (isContentCoordination) route = `/marketing/edit/${id}/content-coordination/${params.row._id}`;
                            if (isLogistics) route = `/marketing/edit/${id}/logistics/${params.row._id}`;
                            if (isContentLive) route = `/marketing/edit/${id}/content-live/${params.row._id}`;
                            if (isAssetCollection) route = `/marketing/edit/${id}/asset-collection/${params.row._id}`;
                            if (isBillingCoordination) route = `/marketing/edit/${id}/billing-confirmation/${params.row._id}`;

                            navigate(route, {
                                state: {
                                    stageName: params.row.stageName,
                                    campaignTitle: campaign?.campaignName
                                }
                            });
                        }}
                        sx={{
                            color: isInProgress ? '#5386e4' : '#ccc',
                            cursor: isInProgress ? 'pointer' : 'not-allowed'
                        }}
                    >
                        <Edit />
                    </IconButton>
                );
            }
        }
    ];

    return (
        <Box sx={{ p: 3 }}>
            <Button startIcon={<ArrowBack />} onClick={() => navigate('/marketing')} sx={{ mb: 2 }}>
                Back to Campaigns
            </Button>

            <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                Edit Campaign & Workflow
            </Typography>

            {/* Stages Table */}
            <Box sx={{ bgcolor: 'white', p: 3, borderRadius: 2, boxShadow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Workflow Stages</Typography>
                    <Typography variant="subtitle1" fontWeight="bold" color="text.secondary">
                        Campaign Name: {campaign?.campaignName}
                    </Typography>
                </Box>
                <DataGrid
                    rows={stages.map((s, i) => ({ ...s, sno: i + 1 }))}
                    columns={stageColumns}
                    getRowId={(row) => row._id}
                    autoHeight
                    disableVirtualization
                    sx={{
                        bgcolor: 'white',

                        // Sticky column: S.No
                        '& .MuiDataGrid-columnHeader[data-field="sno"]': {
                            position: 'sticky !important',
                            left: '0 !important',
                            zIndex: '100 !important', // Higher than everything else
                            backgroundColor: '#f8f9fa !important',
                        },
                        '& .MuiDataGrid-cell[data-field="sno"]': {
                            position: 'sticky !important',
                            left: '0 !important',
                            zIndex: '10 !important',
                            backgroundColor: 'white !important',
                        },
                        // Sticky column: Stage Name
                        '& .MuiDataGrid-columnHeader[data-field="stageName"]': {
                            position: 'sticky !important',
                            left: '80px !important',
                            zIndex: '100 !important', // Higher than everything else
                            backgroundColor: '#f8f9fa !important',
                        },
                        '& .MuiDataGrid-cell[data-field="stageName"]': {
                            position: 'sticky !important',
                            left: '80px !important',
                            zIndex: '10 !important',
                            backgroundColor: 'white !important',
                            borderRight: '1px solid #e0e0e0',
                            boxShadow: '4px 0 8px -2px rgba(0,0,0,0.1)',
                        }
                    }}
                />
            </Box>
        </Box>
    );
}

export default CampaignStages;
