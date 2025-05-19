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

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/map" element={<Map />} />
              <Route path="/service/:id" element={<ServiceDetails />} />
              <Route path="/about" element={<About />} />
            </Routes>
          </Layout>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
