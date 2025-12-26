import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Tabs,
    Tab,
    Button,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    MenuItem,
    IconButton
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Add, Edit, Delete } from '@mui/icons-material';
import {
    createBrand,
    getBrands,
    updateBrand,
    deleteBrand,
    createProduct,
    getProducts,
    updateProduct,
    deleteProduct,
    getUsers,
    createUser,
    updateUser,
    deleteUser,
    getCampaignStages,
    createCampaignStage,
    updateCampaignStage,
    deleteCampaignStage
} from '../services/api';
import { toast } from 'react-toastify';

function Masters() {
    const [tabValue, setTabValue] = useState(0);
    const [brands, setBrands] = useState([]);
    const [products, setProducts] = useState([]);
    const [users, setUsers] = useState([]);
    const [campaignStages, setCampaignStages] = useState([]);
    const [openBrandDialog, setOpenBrandDialog] = useState(false);
    const [openProductDialog, setOpenProductDialog] = useState(false);
    const [openUserDialog, setOpenUserDialog] = useState(false);
    const [openStageDialog, setOpenStageDialog] = useState(false);
    const [editingBrandId, setEditingBrandId] = useState(null);
    const [editingProductId, setEditingProductId] = useState(null);
    const [editingUserId, setEditingUserId] = useState(null);
    const [editingStageId, setEditingStageId] = useState(null);

    const [brandForm, setBrandForm] = useState({ name: '' });
    const [productForm, setProductForm] = useState({ name: '' });
    const [stageForm, setStageForm] = useState({
        stageName: '',
        stakeholders: '',
        ackFrom: '',
        workflowType: 'sequence',
        stageOrder: 0,
        sla: '',
        status: 'active'
    });
    const [userForm, setUserForm] = useState({
        name: '',
        email: '',
        username: '',
        password: '',
        role: 'onboarder'
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchBrands();
        fetchProducts();
        fetchUsers();
        fetchCampaignStages();
    }, []);

    const fetchBrands = async () => {
        try {
            const res = await getBrands();
            setBrands(res.data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch brands');
        }
    };

    const fetchProducts = async () => {
        try {
            const res = await getProducts();
            setProducts(res.data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch products');
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await getUsers();
            setUsers(res.data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch users');
        }
    };

    const fetchCampaignStages = async () => {
        try {
            const res = await getCampaignStages();
            setCampaignStages(res.data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch campaign stages');
        }
    };

    const handleBrandSubmit = async () => {
        try {
            if (editingBrandId) {
                await updateBrand(editingBrandId, brandForm);
                toast.success('Brand updated successfully');
            } else {
                await createBrand(brandForm);
                toast.success('Brand added successfully');
            }
            handleCloseBrandDialog();
            fetchBrands();
        } catch (error) {
            console.error(error);
            toast.error(editingBrandId ? 'Failed to update brand' : 'Failed to add brand');
        }
    };

    const handleCloseBrandDialog = () => {
        setOpenBrandDialog(false);
        setEditingBrandId(null);
        setBrandForm({ name: '' });
    };

    const handleEditBrand = (brand) => {
        setEditingBrandId(brand._id);
        setBrandForm({ name: brand.name });
        setOpenBrandDialog(true);
    };

    const handleDeleteBrand = async (id) => {
        if (window.confirm('Are you sure you want to delete this brand?')) {
            try {
                await deleteBrand(id);
                toast.success('Brand deleted successfully');
                fetchBrands();
            } catch (error) {
                console.error(error);
                toast.error('Failed to delete brand');
            }
        }
    };

    const handleProductSubmit = async () => {
        try {
            if (editingProductId) {
                await updateProduct(editingProductId, productForm);
                toast.success('Product updated successfully');
            } else {
                await createProduct(productForm);
                toast.success('Product added successfully');
            }
            handleCloseProductDialog();
            fetchProducts();
        } catch (error) {
            console.error(error);
            toast.error(editingProductId ? 'Failed to update product' : 'Failed to add product');
        }
    };

    const handleCloseProductDialog = () => {
        setOpenProductDialog(false);
        setEditingProductId(null);
        setProductForm({ name: '' });
    };

    const handleEditProduct = (product) => {
        setEditingProductId(product._id);
        setProductForm({ name: product.name });
        setOpenProductDialog(true);
    };

    const handleDeleteProduct = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await deleteProduct(id);
                toast.success('Product deleted successfully');
                fetchProducts();
            } catch (error) {
                console.error(error);
                toast.error('Failed to delete product');
            }
        }
    };

    const handleUserSubmit = async () => {
        try {
            if (editingUserId) {
                const dataToUpdate = { ...userForm };
                if (!dataToUpdate.password) delete dataToUpdate.password;

                await updateUser(editingUserId, dataToUpdate);
                toast.success('User updated successfully');
            } else {
                await createUser(userForm);
                toast.success('User added successfully');
            }
            handleCloseUserDialog();
            fetchUsers();
        } catch (error) {
            console.error(error);
            toast.error(editingUserId ? 'Failed to update user' : 'Failed to add user');
        }
    };

    const handleCloseUserDialog = () => {
        setOpenUserDialog(false);
        setEditingUserId(null);
        setUserForm({
            name: '',
            email: '',
            username: '',
            password: '',
            role: 'onboarder'
        });
    };

    const handleEditUser = (user) => {
        setEditingUserId(user._id);
        setUserForm({
            name: user.name,
            email: user.email,
            username: user.username,
            password: '', // Don't fill password on edit
            role: user.role
        });
        setOpenUserDialog(true);
    };

    const handleDeleteUser = async (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await deleteUser(id);
                toast.success('User deleted successfully');
                fetchUsers();
            } catch (error) {
                console.error(error);
                toast.error('Failed to delete user');
            }
        }
    };

    const handleStageSubmit = async () => {
        try {
            if (editingStageId) {
                await updateCampaignStage(editingStageId, stageForm);
                toast.success('Stage updated successfully');
            } else {
                await createCampaignStage(stageForm);
                toast.success('Stage added successfully');
            }
            handleCloseStageDialog();
            fetchCampaignStages();
        } catch (error) {
            console.error(error);
            toast.error(editingStageId ? 'Failed to update stage' : 'Failed to add stage');
        }
    };

    const handleCloseStageDialog = () => {
        setOpenStageDialog(false);
        setEditingStageId(null);
        setStageForm({
            stageName: '',
            stakeholders: '',
            ackFrom: '',
            workflowType: 'sequence',
            stageOrder: 0,
            sla: '',
            status: 'active'
        });
    };

    const handleEditStage = (stage) => {
        setEditingStageId(stage._id);
        setStageForm({
            stageName: stage.stageName,
            stakeholders: stage.stakeholders || '',
            ackFrom: stage.ackFrom || '',
            workflowType: stage.workflowType || 'sequence',
            stageOrder: stage.stageOrder || 0,
            sla: stage.sla || '',
            status: stage.status
        });
        setOpenStageDialog(true);
    };

    const handleDeleteStage = async (id) => {
        if (window.confirm('Are you sure you want to delete this stage?')) {
            try {
                await deleteCampaignStage(id);
                toast.success('Stage deleted successfully');
                fetchCampaignStages();
            } catch (error) {
                console.error(error);
                toast.error('Failed to delete stage');
            }
        }
    };

    const brandColumns = [
        { field: 'sno', headerName: 'S.No', width: 80 },
        { field: 'name', headerName: 'Brand Name', width: 200 },
        {
            field: 'createdAt',
            headerName: 'Created At',
            width: 200,
            valueFormatter: (params) => {
                if (!params.value) return '-';
                return new Date(params.value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
            }
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 200,
            renderCell: (params) => (
                <Box>
                    <IconButton size="small" onClick={() => handleEditBrand(params.row)} sx={{ color: '#5386e4' }}>
                        <Edit />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDeleteBrand(params.row._id)} sx={{ color: '#f44336' }}>
                        <Delete />
                    </IconButton>
                </Box>
            )
        }
    ];

    const productColumns = [
        { field: 'sno', headerName: 'S.No', width: 80 },
        { field: 'name', headerName: 'Product Name', width: 200 },
        {
            field: 'createdAt',
            headerName: 'Created At',
            width: 200,
            valueFormatter: (params) => {
                if (!params.value) return '-';
                return new Date(params.value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
            }
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 150,
            renderCell: (params) => (
                <Box>
                    <IconButton size="small" onClick={() => handleEditProduct(params.row)} sx={{ color: '#5386e4' }}>
                        <Edit />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDeleteProduct(params.row._id)} sx={{ color: '#f44336' }}>
                        <Delete />
                    </IconButton>
                </Box>
            )
        }
    ];

    const userColumns = [
        { field: 'name', headerName: 'Name', width: 200 },
        { field: 'email', headerName: 'Email', width: 250 },
        { field: 'username', headerName: 'Username', width: 150 },
        { field: 'role', headerName: 'Role', width: 150 },
        {
            field: 'createdAt',
            headerName: 'Created At',
            width: 180,
            valueFormatter: (params) => {
                if (!params.value) return '-';
                return new Date(params.value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
            }
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 150,
            renderCell: (params) => (
                <Box>
                    <IconButton size="small" onClick={() => handleEditUser(params.row)} sx={{ color: '#5386e4' }}>
                        <Edit />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDeleteUser(params.row._id)} sx={{ color: '#f44336' }}>
                        <Delete />
                    </IconButton>
                </Box>
            )
        }
    ];

    const stageColumns = [
        { field: 'sno', headerName: 'S.No', width: 80 },
        { field: 'stageName', headerName: 'Stage Name', width: 250 },
        { field: 'status', headerName: 'Status', width: 150 },
        {
            field: 'createdAt',
            headerName: 'Created At',
            width: 200,
            valueFormatter: (params) => {
                if (!params.value) return '-';
                return new Date(params.value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
            }
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 150,
            renderCell: (params) => (
                <Box>
                    <IconButton size="small" onClick={() => handleEditStage(params.row)} sx={{ color: '#5386e4' }}>
                        <Edit />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDeleteStage(params.row._id)} sx={{ color: '#f44336' }}>
                        <Delete />
                    </IconButton>
                </Box>
            )
        }
    ];

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>Masters</Typography>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
                    <Tab label="Users" />
                    <Tab label="Brands" />
                    <Tab label="Products" />
                    <Tab label="Marketing" />
                </Tabs>
            </Box>

            {/* Users Tab */}
            <div role="tabpanel" hidden={tabValue !== 0}>
                {tabValue === 0 && (
                    <Box>
                        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                            <Button
                                variant="contained"
                                startIcon={<Add />}
                                onClick={() => setOpenUserDialog(true)}
                            >
                                Add User
                            </Button>
                        </Box>
                        <DataGrid
                            rows={users}
                            columns={userColumns}
                            getRowId={(row) => row._id}
                            autoHeight
                            sx={{ bgcolor: 'white' }}
                        />
                    </Box>
                )}
            </div>

            {/* Brand Tab */}
            <div role="tabpanel" hidden={tabValue !== 1}>
                {tabValue === 1 && (
                    <Box>
                        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                            <Button
                                variant="contained"
                                startIcon={<Add />}
                                onClick={() => setOpenBrandDialog(true)}
                            >
                                Add Brand
                            </Button>
                        </Box>
                        <DataGrid
                            rows={brands.map((b, i) => ({ ...b, sno: i + 1 }))}
                            columns={brandColumns}
                            getRowId={(row) => row._id}
                            autoHeight
                            sx={{ bgcolor: 'white' }}
                        />
                    </Box>
                )}
            </div>

            {/* Product Tab */}
            <div role="tabpanel" hidden={tabValue !== 2}>
                {tabValue === 2 && (
                    <Box>
                        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                            <Button
                                variant="contained"
                                startIcon={<Add />}
                                onClick={() => setOpenProductDialog(true)}
                            >
                                Add Product
                            </Button>
                        </Box>
                        <DataGrid
                            rows={products.map((p, i) => ({ ...p, sno: i + 1 }))}
                            columns={productColumns}
                            getRowId={(row) => row._id}
                            autoHeight
                            sx={{ bgcolor: 'white' }}
                        />
                    </Box>
                )}
            </div>

            {/* Marketing Tab */}
            <div role="tabpanel" hidden={tabValue !== 3}>
                {tabValue === 3 && (
                    <Box>

                        <DataGrid
                            rows={campaignStages.map((s, i) => ({ ...s, sno: i + 1 }))}
                            columns={stageColumns}
                            getRowId={(row) => row._id}
                            autoHeight
                            sx={{ bgcolor: 'white' }}
                        />
                    </Box>
                )}
            </div>

            {/* Brand Dialog */}
            <Dialog open={openBrandDialog} onClose={handleCloseBrandDialog} maxWidth="sm" fullWidth>
                <DialogTitle>{editingBrandId ? 'Edit Brand' : 'Add Brand'}</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label="Brand Name"
                            fullWidth
                            value={brandForm.name}
                            onChange={(e) => setBrandForm({ ...brandForm, name: e.target.value })}
                        />

                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseBrandDialog}>Cancel</Button>
                    <Button onClick={handleBrandSubmit} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>

            {/* Product Dialog */}
            <Dialog open={openProductDialog} onClose={handleCloseProductDialog} maxWidth="sm" fullWidth>
                <DialogTitle>{editingProductId ? 'Edit Product' : 'Add Product'}</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label="Product Name"
                            fullWidth
                            value={productForm.name}
                            onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseProductDialog}>Cancel</Button>
                    <Button onClick={handleProductSubmit} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>

            {/* User Dialog */}
            <Dialog open={openUserDialog} onClose={handleCloseUserDialog} maxWidth="sm" fullWidth>
                <DialogTitle>{editingUserId ? 'Edit User' : 'Add User'}</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label="Name"
                            fullWidth
                            value={userForm.name}
                            onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                            required
                        />
                        <TextField
                            label="Email"
                            type="email"
                            fullWidth
                            value={userForm.email}
                            onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                            required
                        />
                        <TextField
                            label="Username"
                            fullWidth
                            value={userForm.username}
                            onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                            required
                        />
                        <TextField
                            label="Password"
                            type="password"
                            fullWidth
                            value={userForm.password}
                            onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                            required={!editingUserId}
                            helperText={editingUserId ? "Leave blank to keep current password" : ""}
                        />
                        <TextField
                            select
                            label="Role"
                            fullWidth
                            value={userForm.role}
                            onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                            required
                        >
                            <MenuItem value="admin">Admin</MenuItem>
                            <MenuItem value="super_admin">Super Admin</MenuItem>
                            <MenuItem value="onboarder">Onboarder</MenuItem>
                        </TextField>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseUserDialog}>Cancel</Button>
                    <Button onClick={handleUserSubmit} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>

            {/* Stage Dialog */}
            <Dialog open={openStageDialog} onClose={handleCloseStageDialog} maxWidth="sm" fullWidth>
                <DialogTitle>{editingStageId ? 'Edit Stage' : 'Add Stage'}</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label="Stage Name"
                            fullWidth
                            value={stageForm.stageName}
                            InputProps={{
                                readOnly: true,
                            }}
                            disabled={true}
                        />
                        <TextField
                            label="Stakeholders"
                            fullWidth
                            value={stageForm.stakeholders}
                            onChange={(e) => setStageForm({ ...stageForm, stakeholders: e.target.value })}
                        />
                        <TextField
                            label="Ack From"
                            fullWidth
                            value={stageForm.ackFrom}
                            onChange={(e) => setStageForm({ ...stageForm, ackFrom: e.target.value })}
                        />
                        <TextField
                            select
                            label="Workflow Type"
                            fullWidth
                            value={stageForm.workflowType}
                            onChange={(e) => setStageForm({ ...stageForm, workflowType: e.target.value })}
                        >
                            <MenuItem value="sequence">Sequence</MenuItem>
                            <MenuItem value="parallel">Parallel</MenuItem>
                        </TextField>
                        {stageForm.workflowType === 'parallel' && (
                            <TextField
                                label="Stage Order"
                                type="number"
                                fullWidth
                                value={stageForm.stageOrder}
                                onChange={(e) => setStageForm({ ...stageForm, stageOrder: e.target.value })}
                            />
                        )}
                        <TextField
                            label="SLA (in days)"
                            fullWidth
                            value={stageForm.sla}
                            onChange={(e) => setStageForm({ ...stageForm, sla: e.target.value })}
                        />


                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseStageDialog}>Cancel</Button>
                    <Button onClick={handleStageSubmit} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>
        </Box >
    );
}

export default Masters;
