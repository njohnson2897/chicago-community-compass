import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  Button,
  Chip,
  Divider,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  LocationOn as LocationIcon,
  AccessTime as AccessTimeIcon,
  Phone as PhoneIcon,
  Language as LanguageIcon,
} from "@mui/icons-material";
import { setSelectedService } from "../store/slices/servicesSlice";

function ServiceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { services } = useSelector((state) => state.services);
  const service = services.find((s) => s.id === id);

  useEffect(() => {
    if (service) {
      dispatch(setSelectedService(service));
    }
  }, [service, dispatch]);

  if (!service) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Typography variant="h5">Service not found</Typography>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/")}
            sx={{ mt: 2 }}
          >
            Back to Map
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/")}
          sx={{ mb: 3 }}
        >
          Back to Map
        </Button>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom>
            {service.name}
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Chip
              label={service.category}
              color="primary"
              sx={{ textTransform: "capitalize" }}
            />
          </Box>

          <Typography variant="body1" paragraph>
            {service.description}
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <LocationIcon sx={{ mr: 1 }} />
                <Typography variant="body1">{service.address}</Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <AccessTimeIcon sx={{ mr: 1 }} />
                <Typography variant="body1">{service.hours}</Typography>
              </Box>

              {service.phone && (
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <PhoneIcon sx={{ mr: 1 }} />
                  <Typography variant="body1">{service.phone}</Typography>
                </Box>
              )}

              {service.website && (
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <LanguageIcon sx={{ mr: 1 }} />
                  <Typography
                    variant="body1"
                    component="a"
                    href={service.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ color: "primary.main", textDecoration: "none" }}
                  >
                    Visit Website
                  </Typography>
                </Box>
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper
                sx={{
                  p: 2,
                  backgroundColor: "grey.100",
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Additional Information
                </Typography>
                <Typography variant="body2" paragraph>
                  {service.additionalInfo}
                </Typography>
                {service.requirements && (
                  <>
                    <Typography variant="subtitle1" gutterBottom>
                      Requirements:
                    </Typography>
                    <Typography variant="body2">
                      {service.requirements}
                    </Typography>
                  </>
                )}
              </Paper>
            </Grid>
          </Grid>

          {service.notes && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Important Notes:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {service.notes}
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
}

export default ServiceDetails;
