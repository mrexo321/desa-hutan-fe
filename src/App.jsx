import React from "react";
import { Route, Routes } from "react-router-dom";

// Import halaman Landing & Auth
import Homepage from "./pages/landing/Homepage";
import AboutUs from "./pages/landing/AboutUs";
import Infografis from "./pages/landing/Infografis";
import Login from "./pages/Auth/Login";

// Import halaman Dashboard & Fitur
import Dashboard from "./pages/dashboard/Dashboard";
import DesaHutan from "./pages/desaHutan/DesaHutan";
import PerformaDesa from "./pages/PerfomaDesa/PerformaDesa";
import EditPerformaDesa from "./pages/PerfomaDesa/EditPerformaDesa";
import PotensiDesa from "./pages/PotensiDesa/PotensiDesa";

const App = () => {
  return (
    <Routes>
      {/* Route Publik */}
      <Route path="/" element={<Homepage />} />
      <Route path="/map" element={<MapPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/infografis" element={<Infografis />} />
      <Route path="/about-us" element={<AboutUs />} />

      {/* Route Internal/Dashboard */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/desa-hutan" element={<DesaHutan />} />
      <Route path="/performa-desa" element={<PerformaDesa />} />
      <Route path="/performa-desa/edit" element={<EditPerformaDesa />} />
      <Route path="/potensi-desa" element={<PotensiDesa />} />
    </Routes>
  );
};

export default App;
