import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Logout as LogoutIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import { adminAPI, authAPI } from '../services/api';

function AdminDashboard() {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [providers, setProviders] = useState([]);
  const [stats, setStats] = useState({ total: 0, verified: 0, pending: 0 });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Provider creation dialog
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newProvider, setNewProvider] = useState({
    email: '',
    password: '',
    organizationName: '',
    firstName: '',
    lastName: '',
    phone: '',
  });
  const [creating, setCreating] = useState(false);

  // Edit dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminAPI.getProviders();
      const providerList = response.data.providers || [];
      setProviders(providerList);
      
      // Calculate stats
      setStats({
        total: providerList.length,
        verified: providerList.filter(p => p.verified).length,
        pending: providerList.filter(p => !p.verified).length,
      });
    } catch (err) {
      setError(
        err.response?.data?.error?.message || 'Failed to load providers'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin');
    navigate('/admin/login');
  };

  const handleCreateProvider = async () => {
    try {
      setCreating(true);
      setError('');
      
      await adminAPI.createProvider(newProvider);
      
      setSuccess('Provider created successfully!');
      setCreateDialogOpen(false);
      setNewProvider({
        email: '',
        password: '',
        organizationName: '',
        firstName: '',
        lastName: '',
        phone: '',
      });
      
      // Reload providers
      await loadProviders();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(
        err.response?.data?.error?.message || 'Failed to create provider'
      );
    } finally {
      setCreating(false);
    }
  };

  const handleEditProvider = async () => {
    try {
      setEditing(true);
      setError('');
      
      // Use PUT endpoint to update provider
      const updateData = {
        organizationName: editingProvider.organizationName,
        firstName: editingProvider.firstName,
        lastName: editingProvider.lastName,
        phone: editingProvider.phone,
        verified: editingProvider.verified,
      };
      
      // If password is provided, include it
      if (editingProvider.newPassword) {
        updateData.password = editingProvider.newPassword;
      }
      
      await adminAPI.updateProvider(editingProvider.id, updateData);
      
      setSuccess('Provider updated successfully!');
      setEditDialogOpen(false);
      setEditingProvider(null);
      
      await loadProviders();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update provider');
    } finally {
      setEditing(false);
    }
  };

  const handleDeleteProvider = async (id) => {
    if (!window.confirm('Are you sure you want to delete this provider? This will also delete all their services and events.')) {
      return;
    }

    try {
      setError('');
      await adminAPI.deleteProvider(id);
      
      setSuccess('Provider deleted successfully!');
      await loadProviders();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete provider');
    }
  };

  const openEditDialog = (provider) => {
    setEditingProvider({
      ...provider,
      newPassword: '', // Don't populate password field
    });
    setEditDialogOpen(true);
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Admin Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage providers and platform settings
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      Total Providers
                    </Typography>
                    <Typography variant="h4">{stats.total}</Typography>
                  </Box>
                  <PeopleIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      Verified Providers
                    </Typography>
                    <Typography variant="h4">{stats.verified}</Typography>
                  </Box>
                  <BusinessIcon sx={{ fontSize: 40, color: 'success.main' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      Pending Verification
                    </Typography>
                    <Typography variant="h4">{stats.pending}</Typography>
                  </Box>
                  <EventIcon sx={{ fontSize: 40, color: 'warning.main' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Providers Table */}
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Providers</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateDialogOpen(true)}
            >
              Create Provider
            </Button>
          </Box>

          {providers.length === 0 ? (
            <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 4 }}>
              No providers yet. Create your first provider account.
            </Typography>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Organization</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Contact</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Services</TableCell>
                    <TableCell>Events</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {providers.map((provider) => (
                    <TableRow key={provider.id}>
                      <TableCell>{provider.organizationName}</TableCell>
                      <TableCell>{provider.email}</TableCell>
                      <TableCell>
                        {provider.firstName && provider.lastName
                          ? `${provider.firstName} ${provider.lastName}`
                          : 'N/A'}
                        {provider.phone && <br />}
                        {provider.phone}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={provider.verified ? 'Verified' : 'Pending'}
                          color={provider.verified ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{provider._count?.services || 0}</TableCell>
                      <TableCell>{provider._count?.events || 0}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => openEditDialog(provider)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteProvider(provider.id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>

        {/* Create Provider Dialog */}
        <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Create New Provider</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <TextField
                label="Email"
                type="email"
                fullWidth
                required
                value={newProvider.email}
                onChange={(e) => setNewProvider({ ...newProvider, email: e.target.value })}
              />
              <TextField
                label="Password"
                type="password"
                fullWidth
                required
                value={newProvider.password}
                onChange={(e) => setNewProvider({ ...newProvider, password: e.target.value })}
                helperText="Minimum 6 characters"
              />
              <TextField
                label="Organization Name"
                fullWidth
                required
                value={newProvider.organizationName}
                onChange={(e) => setNewProvider({ ...newProvider, organizationName: e.target.value })}
              />
              <TextField
                label="First Name"
                fullWidth
                value={newProvider.firstName}
                onChange={(e) => setNewProvider({ ...newProvider, firstName: e.target.value })}
              />
              <TextField
                label="Last Name"
                fullWidth
                value={newProvider.lastName}
                onChange={(e) => setNewProvider({ ...newProvider, lastName: e.target.value })}
              />
              <TextField
                label="Phone"
                fullWidth
                value={newProvider.phone}
                onChange={(e) => setNewProvider({ ...newProvider, phone: e.target.value })}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleCreateProvider}
              variant="contained"
              disabled={creating || !newProvider.email || !newProvider.password || !newProvider.organizationName}
            >
              {creating ? 'Creating...' : 'Create Provider'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Provider Dialog */}
        <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Edit Provider</DialogTitle>
          <DialogContent>
            {editingProvider && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                <TextField
                  label="Email"
                  type="email"
                  fullWidth
                  disabled
                  value={editingProvider.email}
                  helperText="Email cannot be changed"
                />
                <TextField
                  label="Organization Name"
                  fullWidth
                  required
                  value={editingProvider.organizationName}
                  onChange={(e) => setEditingProvider({ ...editingProvider, organizationName: e.target.value })}
                />
                <TextField
                  label="First Name"
                  fullWidth
                  value={editingProvider.firstName || ''}
                  onChange={(e) => setEditingProvider({ ...editingProvider, firstName: e.target.value })}
                />
                <TextField
                  label="Last Name"
                  fullWidth
                  value={editingProvider.lastName || ''}
                  onChange={(e) => setEditingProvider({ ...editingProvider, lastName: e.target.value })}
                />
                <TextField
                  label="Phone"
                  fullWidth
                  value={editingProvider.phone || ''}
                  onChange={(e) => setEditingProvider({ ...editingProvider, phone: e.target.value })}
                />
                <TextField
                  label="New Password (leave blank to keep current)"
                  type="password"
                  fullWidth
                  value={editingProvider.newPassword || ''}
                  onChange={(e) => setEditingProvider({ ...editingProvider, newPassword: e.target.value })}
                  helperText="Only enter if you want to change the password"
                />
                <TextField
                  select
                  label="Verification Status"
                  fullWidth
                  value={editingProvider.verified ? 'verified' : 'pending'}
                  onChange={(e) => setEditingProvider({ ...editingProvider, verified: e.target.value === 'verified' })}
                >
                  <MenuItem value="verified">Verified</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                </TextField>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleEditProvider}
              variant="contained"
              disabled={editing || !editingProvider?.organizationName}
            >
              {editing ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
}

export default AdminDashboard;

