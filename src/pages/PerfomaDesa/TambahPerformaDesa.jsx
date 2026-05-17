import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { useQuery, useMutation } from "@tanstack/react-query";
import { performaDesaService } from "../../services/master/performaDesaService";
import { wilayahDesaService } from "../../services/master/wilayahDesaService";
import { indikatorService } from "../../services/master/indikatorService";
import { toast } from "sonner";
import { ChevronLeft, Save, Loader2, Info, Search, ChevronDown, Check } from "lucide-react";

export default function TambahPerformaDesa() {
  const navigate = useNavigate();

  const [desaId, setDesaId] = useState("");
  const [formulaId, setFormulaId] = useState("");
  const [indikatorValues, setIndikatorValues] = useState({});

  // Searchable Dropdown State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchDesa, setSearchDesa] = useState("");
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch Desa
  const { data: desaData, isLoading: isLoadingDesa } = useQuery({
    queryKey: ["allDesaForSelect"],
    queryFn: () => wilayahDesaService.getAllDesa(1, 1000), // Get all for dropdown
  });
  const desaList = desaData?.items || desaData || [];

  console.log(desaList);


  const filteredDesa = useMemo(() => {
    if (!searchDesa) return desaList;
    return desaList.filter((d) =>
      d.nama.toLowerCase().includes(searchDesa.toLowerCase())
    );
  }, [desaList, searchDesa]);

  // Fetch Formulas
  const { data: formulaData, isLoading: isLoadingFormula } = useQuery({
    queryKey: ["allFormulasForSelect"],
    queryFn: () => indikatorService.getAllFormula(),
  });
  const formulaList = formulaData?.data || formulaData || [];

  // Fetch Formula Detail
  const { data: detailFormulaData, isLoading: isLoadingDetailFormula } = useQuery({
    queryKey: ["detailFormulaForCreate", formulaId],
    queryFn: () => indikatorService.getDetailFormula(formulaId),
    enabled: !!formulaId,
  });
  const detailFormula = detailFormulaData?.data || detailFormulaData;
  const indikatorUtamaList = detailFormula?.indikatorUtama || [];

  const { mutate: submitData, isPending } = useMutation({
    mutationFn: (payload) => performaDesaService.createPerformaDesa(payload),
    onSuccess: () => {
      toast.success("Berhasil menambahkan data performa desa!");
      navigate("/dashboard/performa-desa");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Gagal menambahkan data performa desa.");
    },
  });

  const handleIndikatorChange = (indId, value, isDropdown, options = []) => {
    if (isDropdown) {
      const selectedOption = options.find((opt) => opt.id === value);
      if (selectedOption) {
        setIndikatorValues((prev) => ({
          ...prev,
          [indId]: {
            nilai: selectedOption.nilai,
            label: selectedOption.nama || selectedOption.label,
            penilaian_indikator_id: selectedOption.id,
          },
        }));
      } else {
        const newValues = { ...indikatorValues };
        delete newValues[indId];
        setIndikatorValues(newValues);
      }
    } else {
      setIndikatorValues((prev) => ({
        ...prev,
        [indId]: {
          nilai: Number(value),
          label: value,
        },
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!desaId) return toast.error("Silakan pilih Desa terlebih dahulu.");
    if (!formulaId) return toast.error("Silakan pilih Formula terlebih dahulu.");

    // Validasi semua indikator telah diisi
    for (const ind of indikatorUtamaList) {
      if (!indikatorValues[ind.id]) {
        return toast.error(`Indikator "${ind.nama}" belum diisi.`);
      }
    }

    const payload = {
      desa_id: desaId,
      formula_id: formulaId,
      nilai_indikator: indikatorUtamaList.map((ind) => {
        const val = indikatorValues[ind.id];
        return {
          indikator: ind.nama,
          kode: ind.kode,
          nilai: val.nilai,
          label: val.label,
          indikator_utama_id: ind.id,
          ...(val.penilaian_indikator_id && { penilaian_indikator_id: val.penilaian_indikator_id }),
        };
      }),
    };

    submitData(payload);
  };

  return (
    <DashboardLayout activeMenu="Performa Desa">
      <div className="flex flex-col gap-6 bg-slate-50/50 p-4 md:p-6 min-h-full rounded-[2rem]">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-slate-500 hover:text-emerald-700 font-bold text-sm transition-colors w-fit px-3 py-2 -ml-3 rounded-xl hover:bg-emerald-50 mb-2"
            >
              <ChevronLeft size={18} />
              Kembali
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
              Tambah Performa Desa
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Masukkan data penilaian indikator performa untuk desa yang dipilih.
            </p>
          </div>
        </div>

        {/* FORM SECTION */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8 space-y-8">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pilih Desa (Searchable Dropdown) */}
            <div className="space-y-2 relative" ref={dropdownRef}>
              <label className="text-sm font-bold text-slate-700">Pilih Desa</label>

              <div
                onClick={() => !isLoadingDesa && setIsDropdownOpen(!isDropdownOpen)}
                className={`w-full bg-slate-50 border ${isDropdownOpen ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200'} rounded-xl p-3 text-sm text-slate-800 flex justify-between items-center cursor-pointer transition-all font-medium ${isLoadingDesa ? 'opacity-50 cursor-not-allowed' : 'hover:border-slate-300'}`}
              >
                <span className={desaId ? "text-slate-800" : "text-slate-400"}>
                  {desaId ? desaList.find(d => d.id === desaId)?.nama || "Desa tidak valid" : "-- Pilih Desa --"}
                </span>
                {isLoadingDesa ? (
                  <Loader2 size={18} className="animate-spin text-slate-400" />
                ) : (
                  <ChevronDown size={18} className={`text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                )}
              </div>

              {isDropdownOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-3 border-b border-slate-100 bg-slate-50/50">
                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        autoFocus
                        placeholder="Cari nama desa..."
                        value={searchDesa}
                        onChange={(e) => setSearchDesa(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-shadow"
                      />
                    </div>
                  </div>
                  <div className="max-h-60 overflow-y-auto custom-scrollbar">
                    {filteredDesa.length > 0 ? (
                      filteredDesa.map((d) => (
                        <div
                          key={d.id}
                          onClick={() => {
                            setDesaId(d.id);
                            setIsDropdownOpen(false);
                            setSearchDesa("");
                          }}
                          className={`px-4 py-3 text-sm cursor-pointer transition-colors flex items-center justify-between ${desaId === d.id ? 'bg-emerald-50 text-emerald-700 font-bold' : 'hover:bg-slate-50 text-slate-700 font-medium'}`}
                        >
                          {d.nama}
                          {desaId === d.id && <Check size={16} className="text-emerald-600" />}
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-sm text-slate-500">
                        Desa tidak ditemukan
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Pilih Formula */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Pilih Formula Indikator</label>
              <select
                value={formulaId}
                onChange={(e) => {
                  setFormulaId(e.target.value);
                  setIndikatorValues({}); // reset values on formula change
                }}
                disabled={isLoadingFormula}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
              >
                <option value="">-- Pilih Formula --</option>
                {formulaList.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nama}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* DYNAMIC INDICATORS */}
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Info size={20} className="text-emerald-500" />
              Nilai Indikator
            </h3>

            {!formulaId ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-slate-500 font-medium">Silakan pilih Formula terlebih dahulu untuk memunculkan form input indikator.</p>
              </div>
            ) : isLoadingDetailFormula ? (
              <div className="p-8 flex justify-center">
                <Loader2 size={32} className="animate-spin text-emerald-500" />
              </div>
            ) : indikatorUtamaList.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-slate-500 font-medium">Tidak ada indikator yang terhubung dengan formula ini.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {indikatorUtamaList.map((ind) => {
                  const isDropdown = ind.penilaianIndikator && ind.penilaianIndikator.length > 0;

                  return (
                    <div key={ind.id} className="space-y-2 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                      <label className="block text-xs font-bold text-slate-700 leading-tight">
                        {ind.nama}
                        <span className="ml-2 text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-mono border border-emerald-100">{ind.kode}</span>
                      </label>

                      {isDropdown ? (
                        <select
                          value={indikatorValues[ind.id]?.penilaian_indikator_id || ""}
                          onChange={(e) => handleIndikatorChange(ind.id, e.target.value, true, ind.penilaianIndikator)}
                          className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer"
                        >
                          <option value="">-- Pilih Penilaian --</option>
                          {ind.penilaianIndikator.map((opt) => (
                            <option key={opt.id} value={opt.id}>
                              {opt.nama || opt.label} (Nilai: {opt.nilai})
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="number"
                          placeholder="Masukkan angka..."
                          value={indikatorValues[ind.id]?.label || ""}
                          onChange={(e) => handleIndikatorChange(ind.id, e.target.value, false)}
                          className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex justify-end pt-6">
            <button
              type="submit"
              disabled={isPending || !formulaId || indikatorUtamaList.length === 0}
              className="flex items-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-emerald-600/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {isPending ? "Menyimpan..." : "Simpan Data Performa"}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
