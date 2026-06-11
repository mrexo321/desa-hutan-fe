import React from "react";
import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

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
import TambahPerformaDesa from "./pages/PerfomaDesa/TambahPerformaDesa";
import PerformaDesaDetail from "./pages/PerfomaDesa/PerformaDesaDetail";
import PotensiDesa from "./pages/PotensiDesa/PotensiDesa";
import MapPage from "./MapPage";
import Indikator from "./pages/Indikator/Indikator";
import IndikatorPerhitungan from "./pages/Indikator/IndikatorPerhitungan";
import Klasifikasi from "./pages/Klasifikasi/Klasifikasi";
import Wilayah from "./pages/Wilayah/Wilayah";
import TambahWilayahDesa from "./pages/Wilayah/TambahWilayahDesa";
import EditWilayahDesa from "./pages/Wilayah/EditWilayahDesa";
import ManajemenUser from "./pages/ManajemenUser/ManajemenUser";
import ManajemenRoles from "./pages/ManajemenRole/ManajemenRole";
import MasterWilayah from "./pages/MasterWilayah/MasterWilayah";
import MasterPotensi from "./pages/MasterPotensi/MasterPotensi";
import ProvinceDetail from "./pages/dashboard/ProvinceDetail";
import DetailMainIndikator from "./pages/Indikator/DetailMainIndikator";
import FormMainIndikator from "./pages/Indikator/FormMainIndicator";
import DetailDesa from "./pages/dashboard/DetailDesa";
import DetailFormulaIndicator from "./pages/Indikator/DetailFormulaIndicator";
import FormFormulaIndicator from "./pages/Indikator/FormFormulaIndicator";
import TahunIndikatorPerhitungan from "./pages/Indikator/TahunIndikatorPerhitungan";
import FormTahunIndicator from "./pages/Indikator/FormTahunIndicator";
import CreateRole from "./pages/ManajemenRole/CreateRole";
import EditRole from "./pages/ManajemenRole/EditRole";
import DetailRole from "./pages/ManajemenRole/DetailRole";
import AssignPermission from "./pages/ManajemenRole/AssignPermission";
import SiteSettings from "./pages/SiteSettings/SiteSettings";
import DesaPSN from "./pages/DesaPSN/DesaPSN";

const App = () => {
  return (
    <Routes>
      {/* ======================================================= */}
      {/* ROUTE PUBLIK (Bebas diakses tanpa login)                  */}
      {/* ======================================================= */}
      <Route path="/" element={<Homepage />} />
      <Route path="/map" element={<MapPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/infografis" element={<Infografis />} />
      <Route path="/about-us" element={<AboutUs />} />

      {/* ======================================================= */}
      {/* ROUTE DASHBOARD DASAR (Minimal Wajib Login)               */}
      {/* ======================================================= */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/provinsi/:provinceName"
        element={<ProvinceDetail />}
      />

      <Route path="/dashboard/desa-hutan" element={<DesaHutan />} />
      <Route path="/dashboard/performa-desa" element={<PerformaDesa />} />
      <Route
        path="/dashboard/performa-desa/detail/:id"
        element={<PerformaDesaDetail />}
      />
      <Route
        path="/dashboard/performa-desa/tambah"
        element={<TambahPerformaDesa />}
      />
      <Route
        path="/dashboard/performa-desa/edit/:id"
        element={<EditPerformaDesa />}
      />
      <Route path="/dashboard/potensi-desa" element={<PotensiDesa />} />
      <Route
        path="/dashboard/desa-psn"
        element={
          <ProtectedRoute>
            <DesaPSN />
          </ProtectedRoute>
        }
      />

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
      <Route path="/dashboard/desa-detail/:desaId" element={<DetailDesa />} />
      <Route
        path="/dashboard/indikator-perhitungan"
        element={<IndikatorPerhitungan />}
      />
      <Route
        path="/dashboard/tahun-indikator-perhitungan"
        element={<TahunIndikatorPerhitungan />}
      />
      <Route
        path="/dashboard/tahun-indikator-perhitungan/tambah"
        element={<FormTahunIndicator />}
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

      {/* Klasifikasi & Wilayah Dasar */}
      <Route path="/dashboard/klasifikasi" element={<Klasifikasi />} />
      <Route path="/dashboard/wilayah" element={<Wilayah />} />
      <Route path="/dashboard/master-wilayah" element={<MasterWilayah />} />
      <Route path="/dashboard/master-potensi" element={<MasterPotensi />} />

      {/* ======================================================= */}
      {/* 2. ROUTE SENSITIF (Dilindungi Middleware + Cek Array Izin)*/}
      {/* ======================================================= */}

      <Route
        path="/dashboard/manajemen-user"
        element={
          <ProtectedRoute
            allowedPermissions={[
              "user:read",
              "user:create",
              "user:update",
              "user:delete",
              "user_role:assign",
            ]}
          >
            <ManajemenUser />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/manajemen-role"
        element={
          <ProtectedRoute
            allowedPermissions={[
              "role:read",
              "role:create",
              "role:update",
              "role:delete",
              "role_permission:assign",
            ]}
          >
            <ManajemenRoles />
          </ProtectedRoute>
        }
      />

      {/* --- MANAJEMEN ROLE --- */}
      <Route
        path="/dashboard/manajemen-role"
        element={
          <ProtectedRoute
            allowedPermissions={[
              "role:read",
              "role:create",
              "role:update",
              "role:delete",
              "role_permission:assign",
            ]}
          >
            <ManajemenRoles />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/site-settings"
        element={
          <ProtectedRoute
            allowedPermissions={[
              "site:read",
              "site:update",
            ]}
          >
            <SiteSettings />

            <Route
              path="/dashboard/manajemen-role/create"
              element={
                <ProtectedRoute allowedPermissions={["role:create"]}>
                  <CreateRole />
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/manajemen-role/edit/:id"
              element={
                <ProtectedRoute
                  allowedPermissions={["role:update", "role_permission:assign"]}
                >
                  <EditRole />
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/manajemen-role/detail/:id"
              element={
                <ProtectedRoute allowedPermissions={["role:read"]}>
                  <DetailRole />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/manajemen-role/assign/:id"
              element={
                <ProtectedRoute
                  allowedPermissions={[
                    "role_permission:assign",
                    "role_permission:unassign",
                  ]}
                >
                  <AssignPermission />
                </ProtectedRoute>
              }
            />
          </Routes>
  );
};

      export default App;
