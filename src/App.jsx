import React from "react";
import { Route, Routes } from "react-router-dom";
import Homepage from "./Homepage";
import Login from "./Login";
import Infografis from "./Infografis";
import AboutUs from "./AboutUs";
import Dashboard from "./dashboard/Dashboard";
import DesaHutan from "./pages/DesaHutan";
import PerformaDesa from "./pages/PerfomaDesa/PerfomaDesa";
import EditPerformaDesa from "./pages/PerfomaDesa/EditPerfomaDesa";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/infografis" element={<Infografis />} />
      <Route path="/about-us" element={<AboutUs />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/desa-hutan" element={<DesaHutan />} />
      <Route path="/performa-desa" element={<PerformaDesa />} />
      <Route path="/performa-desa/edit" element={<EditPerformaDesa />} />
    </Routes>
  );
};

export default App;
