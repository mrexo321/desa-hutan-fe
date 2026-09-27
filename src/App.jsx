import React from "react";
import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import GuestRoute from "./components/GuestRoute";
import ChatWidget from "./components/ChatWidget";

// Import halaman Landing & Auth
import Homepage from "./pages/landing/Homepage";
import AboutUs from "./pages/landing/AboutUs";
import Infografis from "./pages/landing/Infografis";
import Login from "./pages/Auth/Login";
import Unauthorized from "./pages/Error/Unauthorized";

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
import MasterIntervensiDesa from "./pages/MasterIntervensiDesa/MasterIntervensiDesa";
import ProvinceDetail from "./pages/dashboard/ProvinceDetail";
import DetailMainIndikator from "./pages/Indikator/DetailMainIndikator";
import FormMainIndikator from "./pages/Indikator/FormMainIndicator";
import IndikatorDimensiTahun from "./pages/Indikator/IndikatorDimensiTahun";

import DesaDetail from "./pages/dashboard/DetailDesa";
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
import AiAsisten from "./pages/AiAsisten/AiAsisten";
import Profile from "./pages/dashboard/Profile";
import DataDesaPublic from "./pages/landing/DataDesaPublic";
import PermintaanData from "./pages/dashboard/PermintaanData";
import ManajemenSitus from "./pages/ManajemenSitus/ManajemenSitus";

const App = () => {
  return (
    <>
      <Routes>
        {/* ======================================================= */}
        {/* ROUTE PUBLIK (Bebas diakses tanpa login)                  */}
        {/* ======================================================= */}
        <Route path="/" element={<Homepage />} />
        <Route path="/map" element={<MapPage />} />
        <Route
          path="/login"
          element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          }
        />
        <Route path="/infografis" element={<Infografis />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/data-desa" element={<DataDesaPublic />} />

        {/* ======================================================= */}
        {/* ROUTE DASHBOARD DASAR (Minimal Wajib Login)               */}
        {/* ======================================================= */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedPermissions={["dashboard:view"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/permintaan-data"
          element={
            <ProtectedRoute allowedPermissions={["permintaan_data:view"]}>
              <PermintaanData />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/provinsi/:provinceName"
          element={
            <ProtectedRoute allowedPermissions={["dashboard:view"]}>
              <ProvinceDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/desa-hutan"
          element={
            <ProtectedRoute allowedPermissions={["performa_desa_hutan:view"]}>
              <DesaHutan />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/performa-desa"
          element={
            <ProtectedRoute allowedPermissions={["performa_desa:view"]}>
              <PerformaDesa />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/performa-desa/edit"
          element={
            <ProtectedRoute allowedPermissions={["performa_desa:view", "performa_desa_hutan:update"]}>
              <EditPerformaDesa />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/potensi-desa"
          element={
            <ProtectedRoute allowedPermissions={["potensi:view"]}>
              <PotensiDesa />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/desa-psn"
          element={
            <ProtectedRoute allowedPermissions={["desa_psn:view"]}>
              <DesaPSN />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/ai-asisten"
          element={
            <ProtectedRoute allowedPermissions={["ai:view"]}>
              <AiAsisten />
            </ProtectedRoute>
          }
        />

        {/* Indikator */}
        <Route
          path="/dashboard/indikator"
          element={
            <ProtectedRoute allowedPermissions={["indikator:view"]}>
              <Indikator />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/indikator/utama/:id"
          element={
            <ProtectedRoute allowedPermissions={["indikator:view"]}>
              <DetailMainIndikator />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/indikator/utama/create"
          element={
            <ProtectedRoute allowedPermissions={["indikator:view", "master_indikator_utama:create"]}>
              <FormMainIndikator />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/indikator/utama/edit/:id"
          element={
            <ProtectedRoute allowedPermissions={["indikator:view", "master_indikator_utama:update"]}>
              <FormMainIndikator />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/indikator/:tahun"
          element={
            <ProtectedRoute allowedPermissions={["indikator:view"]}>
              <IndikatorDimensiTahun />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/desa-detail/:desaId"
          element={
            <ProtectedRoute allowedPermissions={["dashboard:view"]}>
              <DesaDetail />
            </ProtectedRoute>
          }
        />


      {/* --- INDIKATOR PERHITUNGAN (master_indikator_perhitungan) --- */}
      <Route
        path="/dashboard/indikator-perhitungan"
        element={
          <ProtectedRoute allowedPermissions={["master_tahun_indikator_perhitungan:view"]}>
            <IndikatorPerhitungan />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/indikator-perhitungan/:id"
        element={
          <ProtectedRoute allowedPermissions={["master_tahun_indikator_perhitungan:view"]}>
            <DetailFormulaIndicator />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/indikator-perhitungan/tambah"
        element={
          <ProtectedRoute allowedPermissions={["master_tahun_indikator_perhitungan:view", "master_indikator_perhitungan:create"]}>
            <FormFormulaIndicator />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/indikator-perhitungan/edit/:id"
        element={
          <ProtectedRoute allowedPermissions={["master_tahun_indikator_perhitungan:view", "master_indikator_perhitungan:update"]}>
            <FormFormulaIndicator />
          </ProtectedRoute>
        }
      />

      {/* --- TAHUN INDIKATOR PERHITUNGAN (master_tahun_indikator_perhitungan) --- */}
      <Route
        path="/dashboard/tahun-indikator-perhitungan"
        element={
          <ProtectedRoute allowedPermissions={["master_tahun_indikator_perhitungan:view"]}>
            <TahunIndikatorPerhitungan />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/tahun-indikator-perhitungan/tambah"
        element={
          <ProtectedRoute allowedPermissions={["master_tahun_indikator_perhitungan:create"]}>
            <FormTahunIndicator />
          </ProtectedRoute>
        }
      />

      {/* --- KLASIFIKASI (master_klasifikasi) --- */}
      <Route
        path="/dashboard/klasifikasi"
        element={
          <ProtectedRoute allowedPermissions={["master_klasifikasi:view"]}>
            <Klasifikasi />
          </ProtectedRoute>
        }
      />

      {/* --- WILAYAH --- */}
      <Route
        path="/dashboard/wilayah"
        element={
          <ProtectedRoute
            allowedPermissions={["wilayah:view"]}
          >
            <Wilayah />
          </ProtectedRoute>
        }
      />

      {/* --- MASTER WILAYAH --- */}
      <Route
        path="/dashboard/master-wilayah"
        element={
          <ProtectedRoute allowedPermissions={["wilayah_administrasi:view"]}>
            <MasterWilayah />
          </ProtectedRoute>
        }
      />

      {/* --- MASTER POTENSI --- */}
      <Route
        path="/dashboard/master-potensi"
        element={
          <ProtectedRoute allowedPermissions={["potensi:view"]}>
            <MasterPotensi />
          </ProtectedRoute>
        }
      />

      {/* --- MASTER INTERVENSI DESA --- */}
      <Route
        path="/dashboard/master-intervensi-desa"
        element={
          <ProtectedRoute allowedPermissions={["intervensi_desa:view"]}>
            <MasterIntervensiDesa />
          </ProtectedRoute>
        }
      />

      {/* --- MANAJEMEN SITUS TERKAIT --- */}
      <Route
        path="/dashboard/manajemen-situs"
        element={
          <ProtectedRoute allowedPermissions={["site:view"]}>
            <ManajemenSitus />
          </ProtectedRoute>
        }
      />

      {/* ======================================================= */}
      {/* ROUTE SENSITIF (Manajemen User/Role/Settings)             */}
      {/* ======================================================= */}
      <Route
        path="/dashboard/manajemen-user"
        element={
          <ProtectedRoute
            allowedPermissions={[
              "user:view",
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
              "role:view",
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

      {/* --- MANAJEMEN ROLE SUBROUTES --- */}
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
          <ProtectedRoute allowedPermissions={["role:update"]}>
            <EditRole />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/manajemen-role/detail/:id"
        element={
          <ProtectedRoute allowedPermissions={["role:view"]}>
            <DetailRole />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/manajemen-role/assign/:id"
        element={
          <ProtectedRoute allowedPermissions={["role_permission:assign"]}>
            <AssignPermission />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/site-settings"
        element={
          <ProtectedRoute
            allowedPermissions={[
              "site:view",
              "site:update",
            ]}
          >
            <SiteSettings />
          </ProtectedRoute>
        }
      />
    </Routes >

      {/* Floating AI Chatbot Widget — tampil di semua halaman */ }
      < ChatWidget />
    </>
  );
};

export default App;
