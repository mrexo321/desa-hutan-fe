import React from "react";
import { Route, Routes } from "react-router-dom";
import Homepage from "./Homepage";
import Login from "./Login";
import Infografis from "./Infografis";
import AboutUs from "./AboutUs";
import Dashboard from "./dashboard/Dashboard";
import DesaHutan from "./pages/DesaHutan";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/infografis" element={<Infografis />} />
      <Route path="/about-us" element={<AboutUs />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/desa-hutan" element={<DesaHutan />} />
    </Routes>
  );
};

export default App;
