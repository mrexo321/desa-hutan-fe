import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { useQuery, useMutation } from "@tanstack/react-query";
import { performaDesaService } from "../../services/master/performaDesaService";
import { wilayahDesaService } from "../../services/master/wilayahDesaService";
import { indikatorService } from "../../services/master/indikatorService";
import { toast } from "sonner";
import { ChevronLeft, Save, Loader2, Info } from "lucide-react";

export default function EditPerformaDesa() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [desaId, setDesaId] = useState("");
  const [formulaId, setFormulaId] = useState("");
  const [indikatorValues, setIndikatorValues] = useState({});

  // Fetch Existing Performa Data
  const { data: performaResponse, isLoading: isLoadingPerforma } = useQuery({
    queryKey: ["detailPerformaDesa", id],
    queryFn: () => performaDesaService.getDetailPerformaDesa(id),
    enabled: !!id,
  });



  const performaData = performaResponse?.data || performaResponse;
  console.log(performaData);

  // Set initial data once performaData is loaded
  useEffect(() => {
    if (performaData) {
      setDesaId(performaData.desa?.id || "");
      // Ambil id formula dari object formulaIndikatorPerhitungan
      setFormulaId(performaData.formulaIndikatorPerhitungan?.id || "");

      const initialValues = {};
      if (performaData.nilaiIndikator) {
        performaData.nilaiIndikator.forEach((ind) => {
          // Handle camelCase from API response
          const indikatorUtamaId = ind.indikatorUtamaId || ind.indikator_utama_id;
          const penilaianIndikatorId = ind.penilaianIndikatorId || ind.penilaian_indikator_id;

          initialValues[indikatorUtamaId] = {
            nilai: ind.nilai,
            label: ind.label,
            penilaian_indikator_id: penilaianIndikatorId,
          };
        });
      }
      setIndikatorValues(initialValues);
    }
  }, [performaData]);

  // Fetch Formula Detail based on formulaId (either from initial data or user change)
  const { data: detailFormulaData, isLoading: isLoadingDetailFormula } = useQuery({
    queryKey: ["detailFormulaForEdit", formulaId],
    queryFn: () => indikatorService.getDetailFormula(formulaId),
    enabled: !!formulaId,
  });
  const detailFormula = detailFormulaData?.data || detailFormulaData;
  const indikatorUtamaList = detailFormula?.indikatorUtama || [];

  const { mutate: updateData, isPending } = useMutation({
    mutationFn: (payload) => performaDesaService.updatePerformaDesa(id, payload),
    onSuccess: () => {
      toast.success("Berhasil mengubah data performa desa!");
      navigate("/dashboard/performa-desa");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Gagal mengubah data performa desa.");
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

    updateData(payload);
  };

  if (isLoadingPerforma) {
    return (
      <DashboardLayout activeMenu="Performa Desa">
        <div className="flex-1 flex justify-center items-center h-[80vh]">
          <Loader2 size={40} className="animate-spin text-emerald-500" />
        </div>
      </DashboardLayout>
    );
  }

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
              Edit Performa Desa
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Ubah data penilaian indikator performa untuk desa ini.
            </p>
          </div>
        </div>

        {/* FORM SECTION */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8 space-y-8">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Desa (Read-Only) */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Desa yang Diedit</label>
              <input
                type="text"
                value={performaData?.desa?.nama || "Memuat..."}
                disabled
                className="w-full bg-slate-100 border border-slate-200 rounded-xl p-3 text-sm text-slate-500 cursor-not-allowed font-medium"
              />
              <p className="text-xs text-slate-400 mt-1">Data desa tidak dapat diubah pada mode edit.</p>
            </div>

            {/* Formula (Read-Only) */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Formula Indikator</label>
              <input
                type="text"
                value={performaData?.formulaIndikatorPerhitungan?.nama || "Formula Tertentu"}
                disabled
                className="w-full bg-slate-100 border border-slate-200 rounded-xl p-3 text-sm text-slate-500 cursor-not-allowed font-medium"
              />
              <p className="text-xs text-slate-400 mt-1">Formula bersifat tetap untuk data performa ini.</p>
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
                  const currentValue = indikatorValues[ind.id];

                  return (
                    <div key={ind.id} className="space-y-2 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                      <label className="block text-xs font-bold text-slate-700 leading-tight">
                        {ind.nama}
                        <span className="ml-2 text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-mono border border-emerald-100">{ind.kode}</span>
                      </label>

                      {isDropdown ? (
                        <select
                          value={currentValue?.penilaian_indikator_id || ""}
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
                          value={currentValue?.label || currentValue?.nilai || ""}
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
              {isPending ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
