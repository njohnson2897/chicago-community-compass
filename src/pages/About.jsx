import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
} from "@mui/material";

function About() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          About Chicago Community Compass
        </Typography>

        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="body1" paragraph>
            Chicago Community Compass is a comprehensive mapping platform
            designed to connect Chicago residents with essential social
            services. Our mission is to make it easier for people in need to
            find and access the resources they require, whether they're looking
            for food assistance, shelter, healthcare, education, or employment
            services.
          </Typography>

          <Typography variant="body1" paragraph>
            We believe that everyone deserves easy access to the support they
            need, and we're committed to making that process as simple and
            efficient as possible. By bringing together information about
            various social services across Chicago, we aim to create a more
            connected and supportive community.
          </Typography>
        </Paper>

        <Typography variant="h4" gutterBottom sx={{ mt: 4 }}>
          Our Features
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Interactive Map
                </Typography>
                <Typography variant="body2">
                  Explore social services across Chicago with our interactive
                  map. Find locations, get directions, and view detailed
                  information about each service.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Real-Time Updates
                </Typography>
                <Typography variant="body2">
                  Access up-to-date information about service availability,
                  operating hours, and current capacity to help you plan your
                  visit.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Comprehensive Search
                </Typography>
                <Typography variant="body2">
                  Filter and search for services based on your specific needs,
                  location, and preferences to find the most relevant resources.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Paper sx={{ p: 3, mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            How to Use
          </Typography>
          <Typography variant="body1" paragraph>
            1. Use the search bar to find specific services or browse by
            category
          </Typography>
          <Typography variant="body1" paragraph>
            2. Click on map markers to view detailed information about each
            service
          </Typography>
          <Typography variant="body1" paragraph>
            3. Use the filters to narrow down services by type, location, or
            availability
          </Typography>
          <Typography variant="body1" paragraph>
            4. Click on a service card to view more details and get directions
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}

export default About;
