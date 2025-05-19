import { Box, Container, Typography, Button, Grid, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 8 }}>
        <Typography variant="h2" component="h1" gutterBottom align="center">
          Welcome to Chicago Community Compass
        </Typography>
        <Typography
          variant="h5"
          color="text.secondary"
          align="center"
          paragraph
        >
          Your guide to essential social services in Chicago
        </Typography>

        <Grid container spacing={4} sx={{ mt: 4 }}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 4, height: "100%" }}>
              <Typography variant="h4" gutterBottom>
                Find Services Near You
              </Typography>
              <Typography variant="body1" paragraph>
                Explore our interactive map to discover food banks, shelters,
                healthcare services, educational resources, and employment
                opportunities in your area.
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate("/map")}
                sx={{ mt: 2 }}
              >
                View Map
              </Button>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 4, height: "100%" }}>
              <Typography variant="h4" gutterBottom>
                About Our Mission
              </Typography>
              <Typography variant="body1" paragraph>
                Chicago Community Compass is dedicated to connecting residents
                with the resources they need. We believe everyone deserves easy
                access to essential services and support.
              </Typography>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate("/about")}
                sx={{ mt: 2 }}
              >
                Learn More
              </Button>
            </Paper>
          </Grid>
        </Grid>

        <Grid container spacing={4} sx={{ mt: 2 }}>
          <Grid item xs={12}>
            <Paper sx={{ p: 4 }}>
              <Typography variant="h4" gutterBottom align="center">
                Available Services
              </Typography>
              <Grid container spacing={2} sx={{ mt: 2 }}>
                {[
                  "Food Banks",
                  "Shelters",
                  "Healthcare",
                  "Education",
                  "Employment",
                ].map((service) => (
                  <Grid item xs={12} sm={6} md={4} key={service}>
                    <Paper
                      sx={{
                        p: 2,
                        textAlign: "center",
                        backgroundColor: "primary.light",
                        color: "primary.contrastText",
                      }}
                    >
                      <Typography variant="h6">{service}</Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}

export default Home;
