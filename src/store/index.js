import { configureStore } from "@reduxjs/toolkit";
import servicesReducer from "./slices/servicesSlice";
import uiReducer from "./slices/uiSlice";

export const store = configureStore({
  reducer: {
    services: servicesReducer,
    ui: uiReducer,
  },
});
