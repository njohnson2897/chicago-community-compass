import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { Provider } from "react-redux";
import { store } from "./store";
import theme from "./theme";

// Layout
import Layout from "./components/Layout";

// Pages
import Home from "./pages/Home";
import Map from "./pages/Map";
import ServiceDetails from "./pages/ServiceDetails";
import About from "./pages/About";
import ProviderLogin from "./pages/ProviderLogin";
import ProviderDashboard from "./pages/ProviderDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            {/* Public routes with layout */}
            <Route path="/" element={<Layout><Home /></Layout>} />
            <Route path="/map" element={<Layout><Map /></Layout>} />
            <Route path="/service/:id" element={<Layout><ServiceDetails /></Layout>} />
            <Route path="/about" element={<Layout><About /></Layout>} />
            
            {/* Provider routes without layout */}
            <Route path="/provider/login" element={<ProviderLogin />} />
            <Route
              path="/provider/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ProviderDashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
