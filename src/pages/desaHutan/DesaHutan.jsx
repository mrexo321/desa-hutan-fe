import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "../../components/DashboardLayout";
import SyncButton from "../../components/SyncButton";
import { performaDesaService } from "../../services/master/performaDesaService";
import { indikatorService } from "../../services/master/indikatorService";

export default function DesaHutan() {
  const [selectedTahun, setSelectedTahun] = useState("2025");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // ── FETCH TAHUN LIST ──
  const { data: tahunRes } = useQuery({
    queryKey: ["tahun-list"],
    queryFn: indikatorService.getAllYearIndicator,
  });
  const tahunList = tahunRes?.data || tahunRes || [];

  // Effect to select 2025 or the first available year
  useEffect(() => {
    if (tahunList.length > 0) {
      const has2025 = tahunList.some((t) => String(t.tahun) === "2025");
      if (has2025) {
        setSelectedTahun("2025");
      } else {
        setSelectedTahun(String(tahunList[0].tahun));
      }
    }
  }, [tahunList]);

  // ── FETCH PERFORMA DESA HUTAN LIST ──
  const { data: performaRes, isLoading, isError } = useQuery({
    queryKey: ["performa-desa-hutan-list", page, pageSize, selectedTahun],
    queryFn: () =>
      performaDesaService.getIndexPerformaDesaHutan({
        page,
        size: pageSize,
        tahun: selectedTahun,
      }),
    keepPreviousData: true,
  });

  const items = performaRes?.data?.items || performaRes?.items || [];
  const pagination = performaRes?.data?.pagination || performaRes?.pagination || null;
  const total = pagination?.total || 0;
  const totalPages = pagination?.totalPage || 1;

  // Handlers for pagination
  const handlePrevPage = () => {
    if (page > 1) setPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage((prev) => prev + 1);
  };

  const startRow = total > 0 ? (page - 1) * pageSize + 1 : 0;
  const endRow = Math.min(page * pageSize, total);

  // Handlers for action buttons
  const handleView = (row) => alert(`Membuka detail untuk: ${row.namaDesa || row.nama || "-"}`);
  const handleEdit = (row) => alert(`Mengedit data: ${row.namaDesa || row.nama || "-"}`);

  return (
    <DashboardLayout activeMenu="Desa Hutan">
      {/* Wrapper Kartu Putih Besar (Mengikuti Figma) */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col min-h-[calc(100vh-120px)]">

        {/* JUDUL HALAMAN & GARIS */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-full flex items-center justify-between mb-3">
            <div /> {/* spacer kiri */}
            <h2 className="text-xl font-bold text-[#2D7344] tracking-widest uppercase">
              Desa Hutan
            </h2>
            <SyncButton apiBase="/analisis-spasial" />
          </div>
          <div className="w-full h-[2px] bg-[#2D7344]"></div>
        </div>

        {/* FILTER BAR */}
        <div className="flex flex-wrap gap-4 mb-8">
          {/* Tahun Filter */}
          <div className="flex-1 min-w-[220px] max-w-[300px] bg-white rounded-lg border border-gray-200 shadow-sm flex items-center px-4 py-2.5 transition-shadow hover:shadow-md">
            <span className="text-xs text-[#2D7344] font-bold whitespace-nowrap mr-3">
              Tahun
            </span>
            <select
              value={selectedTahun}
              onChange={(e) => {
                setSelectedTahun(e.target.value);
                setPage(1);
              }}
              className="flex-1 w-full bg-transparent text-gray-500 text-xs focus:outline-none appearance-none cursor-pointer"
            >
              {tahunList.length === 0 ? (
                <option value="2025">2025</option>
              ) : (
                tahunList.map((t) => (
                  <option key={t.id || t.tahun} value={t.tahun}>
                    {t.tahun}
                  </option>
                ))
              )}
            </select>
            {/* Custom Arrow */}
            <div className="pointer-events-none text-gray-500 ml-2">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 10l5 5 5-5z" />
              </svg>
            </div>
          </div>
        </div>

        {/* AREA TABEL */}
        <div className="flex-1 bg-white rounded-xl overflow-hidden flex flex-col border border-gray-100 shadow-sm">
          <div className="p-5 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-800">Tabel Data Desa Tahun {selectedTahun}</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-[#2D7344] text-white text-xs font-bold tracking-wide">
                  <th className="py-4 px-6 whitespace-nowrap">KODE</th>
                  <th className="py-4 px-6 whitespace-nowrap">Nama Desa</th>
                  <th className="py-4 px-6 whitespace-nowrap">Fungsi Kawasan</th>
                  <th className="py-4 px-6 whitespace-nowrap">Indeks Desa Hutan</th>
                  <th className="py-4 px-6 whitespace-nowrap">Luas Desa (Ha)</th>
                  {/* <th className="py-4 px-6 text-center whitespace-nowrap">Aksi</th> */}
                </tr>
              </thead>
              <tbody className="text-xs text-gray-600 font-medium">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-gray-400">
                      <div className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-[#2D7344]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Memuat data Desa Hutan...</span>
                      </div>
                    </td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-red-500 font-semibold">
                      Gagal memuat data dari server.
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-gray-400">
                      Tidak ada data Desa Hutan untuk tahun {selectedTahun}.
                    </td>
                  </tr>
                ) : (
                  items.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-gray-100 even:bg-[#E8EEF2] hover:bg-green-50 transition-colors"
                    >
                      <td className="py-4 px-6">{row.kode || "-"}</td>
                      <td className="py-4 px-6 font-semibold text-gray-800">{row.namaDesa || "-"}</td>
                      <td className="py-4 px-6">
                        {Array.isArray(row.fungsiKawasan)
                          ? row.fungsiKawasan
                            .filter((val) => val !== "Areal Penggunaan Lain" && val !== "Area Penggunaan Lain")
                            .join(", ") || "-"
                          : (row.fungsiKawasan === "Areal Penggunaan Lain" || row.fungsiKawasan === "Area Penggunaan Lain"
                            ? "-"
                            : (row.fungsiKawasan || "-"))}
                      </td>
                      <td className="py-4 px-6">{row.indeksDesaHutan || "-"}</td>
                      <td className="py-4 px-6">{row.luasDesaHa ? Number(row.luasDesaHa).toLocaleString("id-ID") : "-"}</td>
                      {/* <td className="py-4 px-6 flex justify-center gap-4"> */}

                      {/* Tombol Lihat (Eye) */}
                      {/* <button 
                          type="button"
                          onClick={() => handleView(row)}
                          className="text-[#3A8353] hover:text-[#1d4d2b] transition-transform hover:scale-125 cursor-pointer outline-none"
                          title="Lihat Detail"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                        </button> */}

                      {/* Tombol Edit (Pencil) */}
                      {/* <button 
                          type="button"
                          onClick={() => handleEdit(row)}
                          className="text-[#3A8353] hover:text-[#1d4d2b] transition-transform hover:scale-125 cursor-pointer outline-none"
                          title="Edit Data"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                          </svg>
                        </button> */}
                      {/* 
                      </td> */}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="mt-auto flex justify-end items-center gap-4 p-5 text-xs text-gray-500 bg-white">
            <span>
              {total > 0 ? `Rows ${startRow}-${endRow} of first ${total}` : "No data"}
            </span>
            <div className="flex gap-2">
              <button
                onClick={handlePrevPage}
                disabled={page === 1 || isLoading}
                className={`transition-colors p-1 ${page === 1 || isLoading ? "text-gray-300 cursor-not-allowed" : "text-gray-800 hover:text-[#2D7344] cursor-pointer"}`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z" />
                </svg>
              </button>
              <button
                onClick={handleNextPage}
                disabled={page >= totalPages || isLoading}
                className={`transition-colors p-1 ${page >= totalPages || isLoading ? "text-gray-300 cursor-not-allowed" : "text-gray-800 hover:text-[#2D7344] cursor-pointer"}`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}