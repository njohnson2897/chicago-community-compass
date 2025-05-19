import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  mapView: {
    center: [-87.6298, 41.8781], // Chicago coordinates
    zoom: 11,
  },
  sidebarOpen: true,
  darkMode: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setMapView: (state, action) => {
      state.mapView = { ...state.mapView, ...action.payload };
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
    },
  },
});

export const { setMapView, setSidebarOpen, toggleDarkMode } = uiSlice.actions;

export default uiSlice.reducer;
