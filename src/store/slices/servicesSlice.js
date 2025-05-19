import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchServicesByCategory } from "../../services/chicagoDataService";

export const fetchServicesByCategoryAsync = createAsyncThunk(
  "services/fetchServicesByCategory",
  async ({ category, subcategory = null }) => {
    console.log("Fetching services for:", { category, subcategory });
    const result = await fetchServicesByCategory(category, subcategory);
    if (result.errors) {
      throw new Error(result.errors.join(", "));
    }
    return result.services;
  }
);

const initialState = {
  services: [],
  filteredServices: [],
  selectedService: null,
  loading: false,
  error: null,
  filters: {
    category: "all",
    subcategory: "all",
    searchQuery: "",
  },
  lastUpdated: null,
};

const servicesSlice = createSlice({
  name: "services",
  initialState,
  reducers: {
    setSelectedService: (state, action) => {
      state.selectedService = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      // Apply filters
      state.filteredServices = state.services.filter((service) => {
        const matchesCategory =
          state.filters.category === "all" ||
          service.category === state.filters.category;
        const matchesSubcategory =
          state.filters.subcategory === "all" ||
          service.subcategory === state.filters.subcategory;
        const matchesSearch =
          state.filters.searchQuery === "" ||
          service.name
            .toLowerCase()
            .includes(state.filters.searchQuery.toLowerCase()) ||
          service.description
            .toLowerCase()
            .includes(state.filters.searchQuery.toLowerCase()) ||
          service.address
            .toLowerCase()
            .includes(state.filters.searchQuery.toLowerCase());
        return matchesCategory && matchesSubcategory && matchesSearch;
      });
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchServicesByCategoryAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServicesByCategoryAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.services = action.payload;
        state.filteredServices = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchServicesByCategoryAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { setSelectedService, setFilters, clearError } =
  servicesSlice.actions;

export default servicesSlice.reducer;
