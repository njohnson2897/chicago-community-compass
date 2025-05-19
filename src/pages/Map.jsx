import { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { setMapView } from "../store/slices/uiSlice";
import {
  setServices,
  setSelectedService,
  setFilters,
} from "../store/slices/servicesSlice";

// Initialize Mapbox
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

function Map() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const dispatch = useDispatch();
  const { mapView, sidebarOpen } = useSelector((state) => state.ui);
  const { services, filteredServices, filters } = useSelector(
    (state) => state.services
  );

  // Initialize map
  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: mapView.center,
      zoom: mapView.zoom,
    });

    map.current.on("move", () => {
      dispatch(
        setMapView({
          center: map.current.getCenter().toArray(),
          zoom: map.current.getZoom(),
        })
      );
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");
  }, []);

  // Update map when view changes
  useEffect(() => {
    if (!map.current) return;
    map.current.flyTo({
      center: mapView.center,
      zoom: mapView.zoom,
      essential: true,
    });
  }, [mapView]);

  // Add markers for services
  useEffect(() => {
    if (!map.current) return;

    // Remove existing markers
    const markers = document.getElementsByClassName("marker");
    while (markers[0]) {
      markers[0].remove();
    }

    // Add new markers
    filteredServices.forEach((service) => {
      const el = document.createElement("div");
      el.className = "marker";
      el.style.width = "20px";
      el.style.height = "20px";
      el.style.borderRadius = "50%";
      el.style.backgroundColor = "#1976d2";
      el.style.border = "2px solid white";
      el.style.cursor = "pointer";

      new mapboxgl.Marker(el)
        .setLngLat(service.coordinates)
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(`
              <h3>${service.name}</h3>
              <p>${service.description}</p>
              <p>Hours: ${service.hours}</p>
            `)
        )
        .addTo(map.current);
    });
  }, [filteredServices]);

  const handleSearchChange = (event) => {
    dispatch(setFilters({ searchQuery: event.target.value }));
  };

  const handleCategoryChange = (event) => {
    dispatch(setFilters({ category: event.target.value }));
  };

  return (
    <Grid container spacing={2} sx={{ height: "calc(100vh - 88px)" }}>
      <Grid item xs={12} md={sidebarOpen ? 9 : 12} sx={{ height: "100%" }}>
        <Paper
          sx={{
            height: "100%",
            position: "relative",
          }}
        >
          <div
            ref={mapContainer}
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
            }}
          />
        </Paper>
      </Grid>
      <Grid item xs={12} md={sidebarOpen ? 3 : 0} sx={{ height: "100%" }}>
        <Paper sx={{ p: 2, height: "100%", overflow: "auto" }}>
          <Typography variant="h6" gutterBottom>
            Find Services
          </Typography>
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              label="Search"
              variant="outlined"
              value={filters.searchQuery}
              onChange={handleSearchChange}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={filters.category}
                label="Category"
                onChange={handleCategoryChange}
              >
                <MenuItem value="all">All Categories</MenuItem>
                <MenuItem value="food">Food Banks</MenuItem>
                <MenuItem value="shelter">Shelters</MenuItem>
                <MenuItem value="healthcare">Healthcare</MenuItem>
                <MenuItem value="education">Education</MenuItem>
                <MenuItem value="employment">Employment</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box>
            {filteredServices.map((service) => (
              <Paper
                key={service.id}
                sx={{
                  p: 2,
                  mb: 2,
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: "action.hover",
                  },
                }}
                onClick={() => dispatch(setSelectedService(service))}
              >
                <Typography variant="h6">{service.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {service.description}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Hours: {service.hours}
                </Typography>
              </Paper>
            ))}
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
}

export default Map;
