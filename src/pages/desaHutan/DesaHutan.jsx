import React, { useState, useEffect, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, RotateCcw, Search, X } from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import SyncButton from "../../components/SyncButton";
import DataTable from "../../components/DataTable";
import Pagination from "../../components/Pagination";
import { performaDesaService } from "../../services/master/performaDesaService";
import { indikatorService } from "../../services/master/indikatorService";
import { masterWilayahService } from "../../services/master/masterWilayahService";
import { klasifikasiService } from "../../services/master/klasifikasiService";

const getArrayData = (res) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.data?.items)) return res.data.items;
  if (Array.isArray(res.items)) return res.items;
  return [];
};

// ── KOMPONEN CUSTOM: SEARCHABLE DROPDOWN (Premium UI & UX) ──
const SearchableDropdown = ({
  label,
  value,
  onChange,
  options = [],
  placeholder = "Pilih opsi",
  required = false,
  emptyMessage = "Tidak ada hasil ditemukan",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset search input when dropdown is closed
  useEffect(() => {
    if (!isOpen) {
      setSearch("");
    }
  }, [isOpen]);

  const selectedOption = useMemo(() => {
    return options.find((opt) => String(opt.value) === String(value));
  }, [options, value]);

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options;
    const query = search.toLowerCase();
    return options.filter((opt) => opt.label.toLowerCase().includes(query));
  }, [options, search]);

  return (
    <div ref={dropdownRef} className="relative w-full flex flex-col">
      {/* CSS Scrollbar Kustom Lokal */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(45, 115, 68, 0.15);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(45, 115, 68, 0.3);
        }
      `}</style>

      {/* Label */}
      <label className="text-[10px] text-[#2D7344] font-extrabold uppercase tracking-wider mb-1 block select-none">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {/* Trigger Button */}
      <div
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full bg-white rounded-xl border flex items-center justify-between px-4 py-2 hover:shadow-md hover:border-gray-300 active:scale-[0.99] transition-all cursor-pointer h-[42px] select-none ${
          isOpen ? "border-[#2D7344]/50 ring-2 ring-[#2D7344]/10 shadow-sm" : "border-gray-200 shadow-sm"
        }`}
      >
        <span className={`text-xs font-bold truncate ${selectedOption ? "text-gray-800" : "text-gray-400"}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={14}
          className={`text-gray-500 transition-transform duration-200 flex-shrink-0 ml-2 ${
            isOpen ? "transform rotate-180 text-[#2D7344]" : ""
          }`}
        />
      </div>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute z-[100] top-[60px] left-0 w-full bg-white border border-gray-150 rounded-2xl shadow-xl p-2 animate-in fade-in slide-in-from-top-2 duration-150 flex flex-col">
          {/* Search Box */}
          <div className="flex items-center gap-2 px-3 py-2 border border-gray-100 rounded-xl mb-2 focus-within:border-[#2D7344]/40 focus-within:ring-2 focus-within:ring-[#2D7344]/10 transition-all bg-slate-50/50 flex-shrink-0">
            <Search size={14} className="text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Cari ${label.toLowerCase()}...`}
              className="w-full bg-transparent text-xs font-bold text-gray-700 focus:outline-none placeholder-gray-400"
              autoFocus
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="text-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Options List */}
          <div className="overflow-y-auto overflow-x-hidden flex-1 space-y-0.5 custom-scrollbar pr-1 max-h-[190px]">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs font-bold text-gray-400 italic">
                {emptyMessage}
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isActive = String(opt.value) === String(value);
                return (
                  <button
                    key={opt.key || opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 flex items-center justify-between ${
                      isActive
                        ? "bg-green-50 text-[#2D7344] font-extrabold"
                        : "text-gray-700 hover:bg-slate-50 hover:text-[#2D7344]"
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2D7344] flex-shrink-0 ml-2" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default function DesaHutan() {
  const [selectedFormulaId, setSelectedFormulaId] = useState("");
  const [selectedTahun, setSelectedTahun] = useState("");
  const [selectedProvinsi, setSelectedProvinsi] = useState("");
  const [selectedIndexDesaHutanId, setSelectedIndexDesaHutanId] = useState("");
  const [selectedFungsiKawasanIds, setSelectedFungsiKawasanIds] = useState([]);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // ── FETCH FORMULA LIST (Wajib) ──
  const { data: formulaRes } = useQuery({
    queryKey: ["formula-list"],
    queryFn: () => indikatorService.getAllFormula(),
  });
  const formulaList = useMemo(() => getArrayData(formulaRes), [formulaRes]);

  // ── FETCH TAHUN LIST (Wajib) ──
  const { data: tahunRes } = useQuery({
    queryKey: ["tahun-list"],
    queryFn: indikatorService.getAllYearIndicator,
  });
  const tahunList = useMemo(() => getArrayData(tahunRes), [tahunRes]);

  // ── FETCH PROVINSI LIST (Opsional) ──
  const { data: provinsiList = [] } = useQuery({
    queryKey: ["provinsi-list"],
    queryFn: () => masterWilayahService.getAllProvinsi(),
  });

  // ── FETCH INDEKS DESA HUTAN LIST (Opsional) ──
  const { data: indexDesaRes } = useQuery({
    queryKey: ["klasifikasi-desa-list"],
    queryFn: () => klasifikasiService.getAllClassificationDesa({ page: 1, perPage: 100 }),
  });
  const indexDesaList = useMemo(() => getArrayData(indexDesaRes), [indexDesaRes]);

  // ── FETCH FUNGSI KAWASAN LIST (Opsional) ──
  const { data: fungsiKawasanRes } = useQuery({
    queryKey: ["klasifikasi-hutan-list"],
    queryFn: () => klasifikasiService.getAllClassificationForest({ page: 1, perPage: 100 }),
  });
  const fungsiKawasanList = useMemo(() => getArrayData(fungsiKawasanRes), [fungsiKawasanRes]);

  // ── FETCH PERFORMA DESA HUTAN LIST ──
  const { data: performaRes, isLoading, isError } = useQuery({
    queryKey: [
      "performa-desa-hutan-list",
      page,
      pageSize,
      selectedFormulaId,
      selectedTahun,
      selectedProvinsi,
      selectedIndexDesaHutanId,
      selectedFungsiKawasanIds,
    ],
    queryFn: () =>
      performaDesaService.getIndexPerformaDesaHutan({
        page,
        size: pageSize,
        formulaId: selectedFormulaId,
        tahun: selectedTahun,
        provinsi: selectedProvinsi || undefined,
        indexDesaHutanId: selectedIndexDesaHutanId || undefined,
        fungsiKawasanId: selectedFungsiKawasanIds.length > 0 ? selectedFungsiKawasanIds : undefined,
      }),
    enabled: !!selectedFormulaId && !!selectedTahun,
    keepPreviousData: true,
  });

  const items = performaRes?.data?.items || performaRes?.items || [];
  const pagination = performaRes?.data?.pagination || performaRes?.pagination || null;
  const total = pagination?.total || 0;
  const totalPages = pagination?.totalPage || 1;

  // ── OPTIONS FORMATTER UNTUK DROPDOWN ──
  const formulaOptions = useMemo(() => {
    return formulaList.map((f) => ({
      value: f.id,
      label: f.nama || f.name || "-",
    }));
  }, [formulaList]);

  const tahunOptions = useMemo(() => {
    return tahunList.map((t) => ({
      value: t.tahun,
      label: String(t.tahun),
    }));
  }, [tahunList]);

  const provinsiOptions = useMemo(() => {
    return provinsiList.map((prov) => {
      const name = prov.name || prov.nama || prov.provinsi || "-";
      return {
        value: name,
        label: name,
        key: prov.id,
      };
    });
  }, [provinsiList]);

  const indexDesaOptions = useMemo(() => {
    return indexDesaList.map((idx) => ({
      value: idx.id,
      label: idx.nama || "-",
    }));
  }, [indexDesaList]);

  // Add precise rowNumber
  const tableData = useMemo(() => {
    return items.map((item, index) => ({
      ...item,
      rowNumber: (page - 1) * pageSize + index + 1,
    }));
  }, [items, page, pageSize]);

  // Columns definition for DataTable
  const columns = useMemo(
    () => [
      {
        header: "No",
        className: "text-center w-16",
        render: (row) => <div className="text-center text-slate-500">{row.rowNumber}</div>,
      },
      {
        header: "KODE",
        render: (row) => <span>{row.kode || "-"}</span>,
      },
      {
        header: "Nama Desa",
        render: (row) => <span className="font-semibold text-gray-800">{row.namaDesa || "-"}</span>,
      },
      {
        header: "Fungsi Kawasan",
        render: (row) => {
          if (Array.isArray(row.fungsiKawasan)) {
            const names = row.fungsiKawasan.map((fk) => (typeof fk === "object" ? fk.nama : fk));
            return <span>{names.join(", ") || "-"}</span>;
          }
          return <span>{row.fungsiKawasan || "-"}</span>;
        },
      },
      {
        header: "Indeks Desa Hutan",
        render: (row) => <span>{row.indeksDesaHutan || "-"}</span>,
      },
      {
        header: "Luas Desa (Ha)",
        render: (row) => (
          <span>{row.luasDesaHa ? Number(row.luasDesaHa).toLocaleString("id-ID") : "-"}</span>
        ),
      },
    ],
    []
  );

  const handleResetFilters = () => {
    setSelectedProvinsi("");
    setSelectedIndexDesaHutanId("");
    setSelectedFungsiKawasanIds([]);
    setPage(1);
  };

  return (
    <DashboardLayout activeMenu="Desa Hutan">
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

        {/* FILTER BAR (Menggunakan z-index agar dropdown tidak terpotong konten di bawahnya) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 relative z-30">

          {/* Formula Filter (Wajib, Searchable) */}
          <SearchableDropdown
            label="Formula"
            value={selectedFormulaId}
            onChange={(val) => {
              setSelectedFormulaId(val);
              setPage(1);
            }}
            options={formulaOptions}
            placeholder="Pilih Formula"
            required={true}
          />

          {/* Tahun Filter (Wajib, Searchable) */}
          <SearchableDropdown
            label="Tahun"
            value={selectedTahun}
            onChange={(val) => {
              setSelectedTahun(val);
              setPage(1);
            }}
            options={tahunOptions}
            placeholder="Pilih Tahun"
            required={true}
          />

          {/* Provinsi Filter (Opsional, Searchable) */}
          <SearchableDropdown
            label="Provinsi"
            value={selectedProvinsi}
            onChange={(val) => {
              setSelectedProvinsi(val);
              setPage(1);
            }}
            options={provinsiOptions}
            placeholder="Semua Provinsi"
          />

          {/* Indeks Desa Hutan Filter (Opsional, Searchable) */}
          <SearchableDropdown
            label="Indeks Desa Hutan"
            value={selectedIndexDesaHutanId}
            onChange={(val) => {
              setSelectedIndexDesaHutanId(val);
              setPage(1);
            }}
            options={indexDesaOptions}
            placeholder="Semua Indeks"
          />

        </div>

        {/* FUNGSI KAWASAN INLINE CHECKBOXES */}
        <div className="mb-6 bg-slate-50/50 border border-slate-100 rounded-2xl p-5 shadow-sm animate-in fade-in duration-300">
          <span className="text-[10px] text-[#2D7344] font-extrabold uppercase tracking-wider block mb-3">
            Fungsi Kawasan (Opsional)
          </span>
          <div className="flex flex-wrap gap-3">
            {fungsiKawasanList.length === 0 ? (
              <span className="text-gray-400 text-xs italic">Memuat daftar fungsi kawasan...</span>
            ) : (
              fungsiKawasanList.map((fk) => {
                const isChecked = selectedFungsiKawasanIds.includes(fk.id);
                return (
                  <label
                    key={fk.id}
                    className={`flex items-center gap-2 px-4 py-2 border rounded-xl cursor-pointer text-xs font-bold select-none transition-all duration-200 ${
                      isChecked
                        ? "bg-green-50 border-[#2D7344]/40 text-[#2D7344] shadow-sm scale-[1.02]"
                        : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {
                        if (isChecked) {
                          setSelectedFungsiKawasanIds((prev) => prev.filter((id) => id !== fk.id));
                        } else {
                          setSelectedFungsiKawasanIds((prev) => [...prev, fk.id]);
                        }
                        setPage(1);
                      }}
                      className="rounded border-gray-300 text-[#2D7344] focus:ring-[#2D7344]/30 cursor-pointer"
                    />
                    <span>{fk.nama || fk.name}</span>
                  </label>
                );
              })
            )}
          </div>
        </div>

        {/* RESET ACTION BAR */}
        {(selectedProvinsi || selectedIndexDesaHutanId || selectedFungsiKawasanIds.length > 0) && (
          <div className="flex justify-end gap-3 mb-6 animate-in fade-in duration-200">
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 active:bg-slate-350 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 shadow-sm transition-all cursor-pointer"
            >
              <RotateCcw size={14} />
              Reset Filter Opsional
            </button>
          </div>
        )}

        {/* AREA TABEL */}
        <div className="flex-1 bg-white rounded-xl overflow-hidden flex flex-col border border-gray-100 shadow-sm">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-800">
              Tabel Data Desa Tahun {selectedTahun || "-"}
            </h3>
            {selectedFormulaId && (
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">
                Formula: {formulaList.find((f) => String(f.id) === String(selectedFormulaId))?.nama || "-"}
              </span>
            )}
          </div>

          <DataTable
            columns={columns}
            data={tableData}
            isLoading={isLoading}
            isError={isError}
            emptyMessage={
              !selectedFormulaId || !selectedTahun
                ? "Silakan pilih Formula dan Tahun terlebih dahulu untuk menampilkan data"
                : "Data Desa Hutan tidak ditemukan"
            }
          />

          {!isLoading && !isError && tableData.length > 0 && (
            <Pagination
              currentPage={page}
              totalPage={totalPages}
              perPage={pageSize}
              total={total}
              onPageChange={setPage}
              onSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
            />
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}
