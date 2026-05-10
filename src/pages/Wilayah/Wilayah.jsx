import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { Plus, Search, Edit2, Trash2, Map, MapPin, UploadCloud, RefreshCw } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { wilayahDesaService } from "../../services/master/wilayahDesaService";
import { wilayahHutanService } from "../../services/master/wilayahHutanService";
import Pagination from "../../components/Pagination";
import DataTable from "../../components/DataTable"; // <-- Import DataTable
import ModalUploadChunked from "../../components/ModalUploadChunk";
import ModalSyncGeom from "../../components/ModalSyncGeom";

// =================================================================
// 1. KOMPONEN TAB WILAYAH HUTAN
// =================================================================
const TabWilayahHutan = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isSyncGeomOpen, setIsSyncGeomOpen] = useState(false);

  const {
    data: response,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["forests", page, size],
    queryFn: () => wilayahHutanService.getAllHutan(page, size),
    keepPreviousData: true,
  });

  const listData = response?.items || [];
  const paginate = response?.pagination || {
    total: 0,
    perPage: size,
    currentPage: 1,
    totalPage: 1,
  };

  // Mapping data untuk menambahkan nomor urut yang presisi dengan pagination
  const tableData = useMemo(() => {
    return listData.map((item, index) => ({
      ...item,
      rowNumber: (paginate.currentPage - 1) * paginate.perPage + index + 1,
    }));
  }, [listData, paginate]);

  // Definisi Kolom untuk DataTable
  const columns = useMemo(
    () => [
      {
        header: "No",
        className: "text-center w-16",
        render: (row) => (
          <div className="text-center text-slate-500">{row.rowNumber}</div>
        ),
      },
      {
        header: "Nama Kawasan / SK",
        render: (row) => (
          <div className="flex flex-col">
            <span className="text-slate-900 font-bold group-hover:text-[#2D7344] transition-colors">
              {row.nama === "-" ? "Tanpa Nama" : row.nama}
            </span>
            <span className="text-[11px] text-slate-400 font-mono italic">
              SK: {row.no_sk_penetapan || "-"}
            </span>
          </div>
        ),
      },
      {
        header: "Fungsi / Kode",
        render: (row) => (
          <div className="flex flex-col">
            <span className="text-slate-700 font-semibold">
              {row.klasifikasi_hutan || "N/A"}
            </span>
            <span className="text-[11px] text-slate-400 uppercase tracking-tighter">
              ID: {row.fungsi_kawasan_hutan_kode || "-"}
            </span>
          </div>
        ),
      },
      {
        header: "Sumber Spasial",
        render: (row) =>
          row.wilayah_hutan_geom ? (
            <div className="flex flex-col items-start gap-1">
              <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[10px] font-bold border border-blue-100 uppercase">
                {row.wilayah_hutan_geom.sumber}
              </span>
              <span className="text-[10px] text-slate-400 truncate max-w-[150px]">
                {row.wilayah_hutan_geom.file_name}
              </span>
            </div>
          ) : (
            <span className="text-slate-300 italic text-xs font-medium">
              Tanpa Spasial
            </span>
          ),
      },
      {
        header: "Luas (Ha)",
        className: "text-right",
        render: (row) => (
          <div className="text-right font-mono text-slate-800 font-bold">
            {new Intl.NumberFormat("id-ID").format(row.luas_ha || 0)}
          </div>
        ),
      },
      {
        header: "Aksi",
        className: "text-center w-36",
        render: (row) => (
          <div className="flex items-center justify-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
            <button
              className="p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
              title="Peta"
            >
              <MapPin size={16} strokeWidth={2.5} />
            </button>
            <button
              className="p-2 text-slate-400 hover:bg-emerald-50 hover:text-[#2D7344] rounded-lg transition-colors"
              title="Edit"
            >
              <Edit2 size={16} strokeWidth={2.5} />
            </button>
            <button
              className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
              title="Hapus"
            >
              <Trash2 size={16} strokeWidth={2.5} />
            </button>
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col min-h-[500px] animate-in fade-in duration-300 overflow-hidden">
      {/* TOOLBAR */}
      <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-slate-50/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-[#2D7344] shrink-0 border border-emerald-100/50">
            <Map size={20} strokeWidth={2.5} />
          </div>
          <h2 className="text-lg font-extrabold text-slate-800 capitalize">
            Data Wilayah Hutan
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-64 group">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#2D7344] transition-colors"
              size={16}
            />
            <input
              type="text"
              placeholder="Cari kawasan hutan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#2D7344] focus:ring-2 focus:ring-emerald-500/10 transition-all font-medium text-slate-700"
            />
          </div>
          <button
            onClick={() => navigate("/dashboard/wilayah/hutan/tambah")}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#2D7344] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#1E5230] transition-colors shadow-sm">
            <Plus size={18} strokeWidth={2.5} /> Tambah Hutan
          </button>
          <button
            onClick={() => setIsUploadOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 border border-[#2D7344] text-[#2D7344] px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-green-50 transition-colors shadow-sm"
          >
            <UploadCloud size={18} strokeWidth={2.5} /> Import SHP
          </button>
          <button
            onClick={() => setIsSyncGeomOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 border border-blue-600 text-blue-600 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-50 transition-colors shadow-sm"
          >
            <RefreshCw size={18} strokeWidth={2.5} /> Sync Geom
          </button>
        </div>
      </div>

      {/* COMPONENT DATATABLE */}
      <DataTable
        columns={columns}
        data={tableData}
        isLoading={isLoading}
        isError={isError}
        searchQuery={searchTerm}
        emptyMessage="Data wilayah hutan tidak ditemukan"
      />

      {/* PAGINATION */}
      {!isLoading && !isError && tableData.length > 0 && (
        <Pagination
          currentPage={paginate.currentPage}
          totalPage={paginate.totalPage}
          perPage={paginate.perPage}
          total={paginate.total}
          onPageChange={setPage}
          onSizeChange={setSize}
        />
      )}
      <ModalUploadChunked
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={() => {
          setIsUploadOpen(false);
          queryClient.invalidateQueries({ queryKey: ["forests"] });
        }}
        uploadType="shpWilayahHutan"
      />

      <ModalSyncGeom
        isOpen={isSyncGeomOpen}
        onClose={() => setIsSyncGeomOpen(false)}
        onSuccess={() => {
          setIsSyncGeomOpen(false);
          queryClient.invalidateQueries({ queryKey: ["forests"] });
        }}
      />
    </div>
  );
};

// =================================================================
// 2. KOMPONEN TAB WILAYAH DESA
// =================================================================
const TabWilayahDesa = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const {
    data: response,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["villages", page, size],
    queryFn: () => wilayahDesaService.getAllDesa(page, size),
    keepPreviousData: true,
  });

  const listData = response?.items || [];
  const paginate = response?.pagination || {
    total: 0,
    perPage: size,
    currentPage: 1,
    totalPage: 1,
  };

  // Mapping data penomoran
  const tableData = useMemo(() => {
    return listData.map((item, index) => ({
      ...item,
      rowNumber: (paginate.currentPage - 1) * paginate.perPage + index + 1,
    }));
  }, [listData, paginate]);

  // Definisi Kolom
  const columns = useMemo(
    () => [
      {
        header: "No",
        className: "text-center w-16",
        render: (row) => (
          <div className="text-center text-slate-500">{row.rowNumber}</div>
        ),
      },
      {
        header: "Nama Desa & Kode",
        render: (row) => (
          <div className="flex flex-col">
            <span className="text-slate-900 font-bold group-hover:text-blue-600 transition-colors">
              {row.nama || "-"}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              {row.kodeKemendagri || "-"}
            </span>
          </div>
        ),
      },
      {
        header: "Kecamatan",
        accessor: "kecamatan",
        render: (row) => (
          <span className="text-slate-700 font-medium">
            {row.kecamatan || "-"}
          </span>
        ),
      },
      {
        header: "Kabupaten / Prov",
        accessor: "kabupaten",
        render: (row) => (
          <span className="text-slate-700 font-medium">
            {row.kabupaten || "-"}
          </span>
        ),
      },
      {
        header: "Sumber Spasial",
        render: (row) => (
          <span className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-md text-[10px] font-bold border border-blue-100 uppercase">
            {row.wilayah_desa_geom?.sumber || "N/A"}
          </span>
        ),
      },
      {
        header: "Luas (Ha)",
        className: "text-right",
        render: (row) => (
          <div className="text-right font-mono text-slate-800 font-bold">
            {new Intl.NumberFormat("id-ID").format(row.luasHa || 0)}
          </div>
        ),
      },
      {
        header: "Aksi",
        className: "text-center w-36",
        render: (row) => (
          <div className="flex items-center justify-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
            <button
              className="p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
              title="Peta"
            >
              <MapPin size={16} strokeWidth={2.5} />
            </button>
            <button
              className="p-2 text-slate-400 hover:bg-emerald-50 hover:text-[#2D7344] rounded-lg transition-colors"
              title="Edit"
            >
              <Edit2 size={16} strokeWidth={2.5} />
            </button>
            <button
              className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
              title="Hapus"
            >
              <Trash2 size={16} strokeWidth={2.5} />
            </button>
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col min-h-[500px] animate-in fade-in duration-300 overflow-hidden">
      {/* TOOLBAR */}
      <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-slate-50/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 border border-blue-100/50">
            <Map size={20} strokeWidth={2.5} />
          </div>
          <h2 className="text-lg font-extrabold text-slate-800 capitalize">
            Data Wilayah Desa
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-64 group">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors"
              size={16}
            />
            <input
              type="text"
              placeholder="Cari wilayah desa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10 transition-all font-medium text-slate-700"
            />
          </div>
          <button
            onClick={() => navigate("/dashboard/wilayah/desa/tambah")}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm">
            <Plus size={18} strokeWidth={2.5} /> Tambah Desa
          </button>
          <button
            onClick={() => setIsUploadOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 border border-blue-600 text-blue-600 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-50 transition-colors shadow-sm"
          >
            <UploadCloud size={18} strokeWidth={2.5} /> Import SHP
          </button>
        </div>
      </div>

      {/* COMPONENT DATATABLE */}
      <DataTable
        columns={columns}
        data={tableData}
        isLoading={isLoading}
        isError={isError}
        searchQuery={searchTerm}
        emptyMessage="Data wilayah desa tidak ditemukan"
      />

      {/* PAGINATION */}
      {!isLoading && !isError && tableData.length > 0 && (
        <Pagination
          currentPage={paginate.currentPage}
          totalPage={paginate.totalPage}
          perPage={paginate.perPage}
          total={paginate.total}
          onPageChange={setPage}
          onSizeChange={setSize}
        />
      )}
      <ModalUploadChunked
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={() => {
          setIsUploadOpen(false);
          queryClient.invalidateQueries({ queryKey: ["villages"] });
        }}
        uploadType="shpWilayahDesa"
      />
    </div>
  );
};

// =================================================================
// 3. KOMPONEN UTAMA (PARENT)
// =================================================================
const Wilayah = () => {
  const [activeTab, setActiveTab] = useState("hutan");

  return (
    <DashboardLayout activeMenu="Wilayah">
      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-[#FAFBFC]">
        <div className="flex-1 overflow-y-auto px-6 md:px-10 py-8 custom-scrollbar">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Manajemen Wilayah
            </h1>
            <p className="text-sm text-slate-500 mt-2 font-medium">
              Kelola data spasial wilayah hutan dan desa.
            </p>
          </div>

          {/* TABS CONTROLLER */}
          <div className="flex p-1.5 bg-slate-200/60 backdrop-blur-sm rounded-xl w-max mb-8 border border-slate-200">
            {["hutan", "desa", "khdtk"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 text-sm font-semibold rounded-lg capitalize transition-all duration-300 ${activeTab === tab
                  ? "bg-white text-[#2D7344] shadow-sm ring-1 ring-slate-900/5"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50"
                  }`}
              >
                Wilayah {tab.toUpperCase()}
              </button>
            ))}
          </div>

          {/* RENDER TAB SECARA KONDISIONAL */}
          {activeTab === "hutan" && <TabWilayahHutan />}
          {activeTab === "desa" && <TabWilayahDesa />}
          {activeTab === "khdtk" && (
            <div className="py-20 text-center flex flex-col items-center justify-center bg-white rounded-2xl shadow-sm border border-slate-200">
              <Map className="w-16 h-16 text-slate-200 mb-4" />
              <h3 className="text-lg font-bold text-slate-700">KHDTK</h3>
              <p className="text-slate-500 mt-1">
                Modul KHDTK sedang dalam pengembangan.
              </p>
            </div>
          )}
        </div>
      </main>
    </DashboardLayout>
  );
};

export default Wilayah;
