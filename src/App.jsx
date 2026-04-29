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
import MapPage from "./MapPage";
import Indikator from "./pages/Indikator/Indikator";
import IndikatorPerhitungan from "./pages/Indikator/IndikatorPerhitungan";
import Klasifikasi from "./pages/Klasifikasi/Klasifikasi";
import Wilayah from "./pages/Wilayah/Wilayah";
import ManajemenUser from "./pages/ManajemenUser/ManajemenUser";
import ManajemenRoles from "./pages/ManajemenRole/ManajemenRole";
import MasterWilayah from "./pages/MasterWilayah/MasterWilayah";
import MasterPotensi from "./pages/MasterPotensi/MasterPotensi";
import ProvinceDetail from "./pages/dashboard/ProvinceDetail";
import DetailMainIndikator from "./pages/Indikator/DetailMainIndikator";
import FormMainIndikator from "./pages/Indikator/FormMainIndicator";
import DesaDetail from "./pages/dashboard/DetailDesa";
import DetailFormulaIndicator from "./pages/Indikator/DetailFormulaIndicator";
import FormFormulaIndicator from "./pages/Indikator/FormFormulaIndicator";

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
      <Route
        path="/dashboard/provinsi/:provinceName"
        element={<ProvinceDetail />}
      />
      <Route path="/dashboard/desa-hutan" element={<DesaHutan />} />
      <Route path="/dashboard/performa-desa" element={<PerformaDesa />} />
      <Route
        path="/dashboard/performa-desa/edit"
        element={<EditPerformaDesa />}
      />
      <Route path="/dashboard/potensi-desa" element={<PotensiDesa />} />
      {/* Indikator */}
      <Route path="/dashboard/indikator" element={<Indikator />} />
      <Route
        path="/dashboard/indikator/utama/:id"
        element={<DetailMainIndikator />}
      />
      <Route
        path="/dashboard/indikator/utama/create"
        element={<FormMainIndikator />}
      />
      <Route
        path="/dashboard/indikator/utama/edit/:id"
        element={<FormMainIndikator />}
      />
      <Route path="/desa-detail/:desaId" element={<DesaDetail />} />
      <Route
        path="/dashboard/indikator-perhitungan"
        element={<IndikatorPerhitungan />}
      />
      <Route
        path="/dashboard/indikator-perhitungan/:id"
        element={<DetailFormulaIndicator />}
      />
      <Route
        path="/dashboard/indikator-perhitungan/tambah"
        element={<FormFormulaIndicator />}
      />
      <Route
        path="/dashboard/indikator-perhitungan/edit/:id"
        element={<FormFormulaIndicator />}
      />

      {/* Klasifikasi */}
      <Route path="/dashboard/klasifikasi" element={<Klasifikasi />} />
      {/* Wilayah */}
      <Route path="/dashboard/wilayah" element={<Wilayah />} />
      {/* Manajemen User */}
      <Route path="/dashboard/manajemen-user" element={<ManajemenUser />} />
      {/* Manajemen Role */}
      <Route path="/dashboard/manajemen-role" element={<ManajemenRoles />} />
      {/* Master Wilayah */}
      <Route path="/dashboard/master-wilayah" element={<MasterWilayah />} />
      {/* Master Potensi */}
      <Route path="/dashboard/master-potensi" element={<MasterPotensi />} />
    </Routes>
  );
};

export default App;
