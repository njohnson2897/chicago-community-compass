import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  IconButton,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import {
  fetchServicesByCategoryAsync,
  setFilters,
} from "../store/slices/servicesSlice";
import { getCategories } from "../services/chicagoDataService";

// Chicago coordinates
const CHICAGO_CENTER = [-87.6298, 41.8781];
const INITIAL_ZOOM = 10;

const Map = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markers = useRef([]);
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSubcategory, setSelectedSubcategory] = useState("all");
  const [categories, setCategories] = useState({});
  const [mapInitialized, setMapInitialized] = useState(false);

  const { services, filteredServices, loading, error } = useSelector(
    (state) => state.services
  );

  // Initialize categories
  useEffect(() => {
    const cats = getCategories();
    console.log("Available categories:", cats);
    setCategories(cats);
  }, []);

  // Initialize map
  useEffect(() => {
    if (map.current) return;

    console.log("Initializing map...");
    console.log("Map container:", mapContainer.current);
    console.log("Mapbox token:", import.meta.env.VITE_MAPBOX_ACCESS_TOKEN);

    try {
      mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/light-v11",
        center: CHICAGO_CENTER,
        zoom: INITIAL_ZOOM,
      });

      map.current.on("load", () => {
        console.log("Map loaded successfully");
        setMapInitialized(true);
      });

      map.current.on("error", (e) => {
        console.error("Mapbox error:", e);
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), "top-right");
    } catch (error) {
      console.error("Error initializing map:", error);
    }

    return () => {
      if (map.current) {
        console.log("Cleaning up map...");
        map.current.remove();
        map.current = null;
        setMapInitialized(false);
      }
    };
  }, []);

  // Update markers when services change
  useEffect(() => {
    console.log("Services updated:", {
      mapInitialized,
      servicesCount: filteredServices.length,
      mapExists: !!map.current,
    });

    if (!map.current || !mapInitialized || !filteredServices.length) {
      console.log("Skipping marker update:", {
        mapInitialized,
        servicesCount: filteredServices.length,
        mapExists: !!map.current,
      });
      return;
    }

    // Clear existing markers
    console.log("Clearing existing markers...");
    markers.current.forEach((marker) => marker.remove());
    markers.current = [];

    // Add new markers
    console.log("Adding new markers...");
    filteredServices.forEach((service) => {
      if (!service.coordinates || service.coordinates.length !== 2) {
        console.warn(
          `Invalid coordinates for service ${service.id}:`,
          service.coordinates
        );
        return;
      }

      const [lng, lat] = service.coordinates;
      if (isNaN(lng) || isNaN(lat)) {
        console.warn(
          `Invalid coordinates for service ${service.id}:`,
          service.coordinates
        );
        return;
      }

      try {
        const el = document.createElement("div");
        el.className = "marker";
        el.style.width = "20px";
        el.style.height = "20px";
        el.style.borderRadius = "50%";
        el.style.backgroundColor = "#FF0000";
        el.style.border = "2px solid white";
        el.style.cursor = "pointer";

        const marker = new mapboxgl.Marker(el)
          .setLngLat([lng, lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(`
              <h3>${service.name}</h3>
              <p>${service.description}</p>
              <p>${service.address}</p>
              ${service.hours ? `<p>Hours: ${service.hours}</p>` : ""}
              ${service.phone ? `<p>Phone: ${service.phone}</p>` : ""}
              ${
                service.website
                  ? `<p><a href="${service.website}" target="_blank">Website</a></p>`
                  : ""
              }
            `)
          )
          .addTo(map.current);

        markers.current.push(marker);
      } catch (error) {
        console.error("Error adding marker:", error);
      }
    });

    // Fit map to markers if there are any
    if (markers.current.length > 0) {
      console.log("Fitting map to markers...");
      try {
        const bounds = new mapboxgl.LngLatBounds();
        markers.current.forEach((marker) => {
          bounds.extend(marker.getLngLat());
        });
        map.current.fitBounds(bounds, {
          padding: 50,
          maxZoom: 15,
        });
      } catch (error) {
        console.error("Error fitting bounds:", error);
      }
    }
  }, [filteredServices, mapInitialized]);

  const handleSearch = (event) => {
    const query = event.target.value;
    setSearchQuery(query);
    dispatch(setFilters({ searchQuery: query }));
  };

  const handleCategoryChange = (event) => {
    const category = event.target.value;
    setSelectedCategory(category);
    setSelectedSubcategory("all");
  };

  const handleSubcategoryChange = (event) => {
    const subcategory = event.target.value;
    setSelectedSubcategory(subcategory);
  };

  const handleSearchClick = () => {
    if (selectedCategory !== "all" && selectedSubcategory !== "all") {
      console.log("Fetching services for:", {
        category: selectedCategory,
        subcategory: selectedSubcategory,
      });
      dispatch(
        fetchServicesByCategoryAsync({
          category: selectedCategory,
          subcategory: selectedSubcategory,
        })
      );
    }
  };

  const handleRefresh = () => {
    handleSearchClick();
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 2,
          mb: 2,
          backgroundColor: "background.paper",
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                label="Category"
                onChange={handleCategoryChange}
              >
                <MenuItem value="all">All Categories</MenuItem>
                {Object.keys(categories).map((category) => (
                  <MenuItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          {selectedCategory !== "all" && categories[selectedCategory] && (
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Subcategory</InputLabel>
                <Select
                  value={selectedSubcategory}
                  label="Subcategory"
                  onChange={handleSubcategoryChange}
                >
                  <MenuItem value="all">All {selectedCategory}</MenuItem>
                  {categories[selectedCategory]
                    .filter((subcategory) => subcategory) // Filter out undefined/null subcategories
                    .map((subcategory) => (
                      <MenuItem key={subcategory} value={subcategory}>
                        {subcategory.charAt(0).toUpperCase() +
                          subcategory.slice(1)}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>
          )}
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Search"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search by name, description, or address"
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Button
                variant="contained"
                startIcon={<SearchIcon />}
                onClick={handleSearchClick}
                disabled={
                  loading ||
                  selectedCategory === "all" ||
                  selectedSubcategory === "all"
                }
                fullWidth
              >
                Search
              </Button>
              <Tooltip title="Refresh data">
                <span>
                  <IconButton
                    onClick={handleRefresh}
                    disabled={
                      loading ||
                      selectedCategory === "all" ||
                      selectedSubcategory === "all"
                    }
                  >
                    <RefreshIcon />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {filteredServices.length} locations found
              </Typography>
              {loading && <CircularProgress size={20} />}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box
        ref={mapContainer}
        sx={{
          flex: 1,
          minHeight: 0,
          position: "relative",
          "& .mapboxgl-map": {
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
          },
          "& .marker": {
            backgroundImage: "url('/marker.png')",
            backgroundSize: "cover",
            width: "30px",
            height: "30px",
            cursor: "pointer",
          },
        }}
      />
    </Box>
  );
};

export default Map;
