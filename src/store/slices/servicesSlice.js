import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  services: [],
  filteredServices: [],
  selectedService: null,
  loading: false,
  error: null,
  filters: {
    category: "all",
    searchQuery: "",
  },
};

const servicesSlice = createSlice({
  name: "services",
  initialState,
  reducers: {
    setServices: (state, action) => {
      state.services = action.payload;
      state.filteredServices = action.payload;
    },
    setSelectedService: (state, action) => {
      state.selectedService = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      // Apply filters
      state.filteredServices = state.services.filter((service) => {
        const matchesCategory =
          state.filters.category === "all" ||
          service.category === state.filters.category;
        const matchesSearch =
          service.name
            .toLowerCase()
            .includes(state.filters.searchQuery.toLowerCase()) ||
          service.description
            .toLowerCase()
            .includes(state.filters.searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      });
    },
  },
});

export const {
  setServices,
  setSelectedService,
  setLoading,
  setError,
  setFilters,
} = servicesSlice.actions;

export default servicesSlice.reducer;
