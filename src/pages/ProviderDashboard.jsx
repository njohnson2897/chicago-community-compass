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
  List,
  ListItem,
  ListItemText,
  IconButton,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Logout as LogoutIcon,
  Business as BusinessIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import { providerAPI, servicesAPI, eventsAPI, authAPI } from '../services/api';

function ProviderDashboard() {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [provider, setProvider] = useState(null);
  const [services, setServices] = useState([]);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [profileRes, servicesRes, eventsRes] = await Promise.all([
        providerAPI.getProfile(),
        providerAPI.getMyServices(),
        providerAPI.getMyEvents(),
      ]);

      setProvider(profileRes.data.provider);
      setServices(servicesRes.data.services || []);
      setEvents(eventsRes.data.events || []);
    } catch (err) {
      setError(
        err.response?.data?.error?.message || 'Failed to load dashboard'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authAPI.logout();
    navigate('/provider/login');
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service?')) {
      return;
    }

    try {
      await servicesAPI.deleteService(id);
      setServices(services.filter((s) => s.id !== id));
    } catch (err) {
      setError(
        err.response?.data?.error?.message || 'Failed to delete service'
      );
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      await eventsAPI.deleteEvent(id);
      setEvents(events.filter((e) => e.id !== id));
    } catch (err) {
      setError(
        err.response?.data?.error?.message || 'Failed to delete event'
      );
    }
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
              Provider Dashboard
            </Typography>
            {provider && (
              <Typography variant="h6" color="text.secondary">
                {provider.organizationName}
              </Typography>
            )}
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

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      Services
                    </Typography>
                    <Typography variant="h4">{services.length}</Typography>
                  </Box>
                  <BusinessIcon sx={{ fontSize: 40, color: 'primary.main' }} />
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
                      Events
                    </Typography>
                    <Typography variant="h4">{events.length}</Typography>
                  </Box>
                  <EventIcon sx={{ fontSize: 40, color: 'secondary.main' }} />
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
                      Status
                    </Typography>
                    <Chip
                      label={provider?.verified ? 'Verified' : 'Pending'}
                      color={provider?.verified ? 'success' : 'warning'}
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab label="Services" />
            <Tab label="Events" />
            <Tab label="Profile" />
          </Tabs>
        </Paper>

        {/* Services Tab */}
        {tabValue === 0 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Your Services</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/provider/services/new')}
              >
                Add Service
              </Button>
            </Box>
            {services.length === 0 ? (
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  No services yet. Create your first service to get started!
                </Typography>
              </Paper>
            ) : (
              <Grid container spacing={2}>
                {services.map((service) => (
                  <Grid item xs={12} md={6} key={service.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" gutterBottom>
                              {service.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              {service.category} {service.subcategory && `- ${service.subcategory}`}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {service.address}
                            </Typography>
                            <Chip
                              label={service.status}
                              size="small"
                              sx={{ mt: 1 }}
                              color={service.status === 'active' ? 'success' : 'default'}
                            />
                          </Box>
                          <Box>
                            <IconButton
                              size="small"
                              onClick={() => navigate(`/provider/services/${service.id}/edit`)}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteService(service.id)}
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}

        {/* Events Tab */}
        {tabValue === 1 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Your Events</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/provider/events/new')}
              >
                Add Event
              </Button>
            </Box>
            {events.length === 0 ? (
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  No events yet. Create your first event to promote your services!
                </Typography>
              </Paper>
            ) : (
              <List>
                {events.map((event) => (
                  <ListItem key={event.id}>
                    <ListItemText
                      primary={event.title}
                      secondary={
                        <>
                          {new Date(event.startDate).toLocaleDateString()} - {event.status}
                          {event.service && ` • ${event.service.name}`}
                        </>
                      }
                    />
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/provider/events/${event.id}/edit`)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteEvent(event.id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        )}

        {/* Profile Tab */}
        {tabValue === 2 && provider && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Profile Information
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Organization Name
                </Typography>
                <Typography variant="body1">{provider.organizationName}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body1">{provider.email}</Typography>
              </Grid>
              {provider.firstName && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    First Name
                  </Typography>
                  <Typography variant="body1">{provider.firstName}</Typography>
                </Grid>
              )}
              {provider.lastName && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Last Name
                  </Typography>
                  <Typography variant="body1">{provider.lastName}</Typography>
                </Grid>
              )}
              {provider.phone && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Phone
                  </Typography>
                  <Typography variant="body1">{provider.phone}</Typography>
                </Grid>
              )}
            </Grid>
            <Button
              variant="outlined"
              sx={{ mt: 3 }}
              onClick={() => navigate('/provider/profile/edit')}
            >
              Edit Profile
            </Button>
          </Paper>
        )}
      </Box>
    </Container>
  );
}

export default ProviderDashboard;

