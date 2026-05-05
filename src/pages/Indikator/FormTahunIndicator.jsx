import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { indikatorService } from "../../services/master/indikatorService";
import { toast } from "sonner";
import { ArrowLeft, Save, Calendar } from "lucide-react";

const FormTahunIndicator = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const queryClient = useQueryClient();

  const [tahun, setTahun] = useState("");

  // Jika mode Edit, fetch data existing
  const { data: existingData, isLoading: isFetching } = useQuery({
    queryKey: ["yearIndicator", id],
    queryFn: () => indikatorService.getYearIndicatorById(id),
    enabled: isEdit, // Hanya jalan jika ada ID
  });

  useEffect(() => {
    if (existingData?.data) {
      setTahun(existingData.data.tahun || existingData.data); // Sesuaikan dengan struktur JSON response
    }
  }, [existingData]);

  // Mutation untuk Create & Update
  const saveMutation = useMutation({
    mutationFn: (payload) =>
      isEdit
        ? indikatorService.updateYearIndicator({ id, data: payload })
        : indikatorService.createYearIndicator(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allYearIndicators"] });
      toast.success(
        `Tahun indikator berhasil ${isEdit ? "diperbarui" : "ditambahkan"}!`,
      );
      navigate("/dashboard/tahun-indikator-perhitungan");
    },
    onError: () => {
      toast.error("Gagal menyimpan data. Silakan coba lagi.");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!tahun) {
      toast.error("Tahun wajib diisi!");
      return;
    }

    // Pastikan payload sesuai permintaan backend, (hanya tahun)
    saveMutation.mutate({ tahun: tahun.toString() });
  };

  return (
    <DashboardLayout activeMenu="Indikator Perhitungan">
      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-[#FAFBFC]">
        <div className="flex-1 overflow-y-auto px-6 md:px-10 py-8 custom-scrollbar">
          <div className="mb-8 flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard/tahun-indikator-perhitungan")}
              className="p-2 hover:bg-slate-200 text-slate-500 rounded-xl transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                {isEdit ? "Edit Tahun Indikator" : "Tambah Tahun Indikator"}
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Silakan isi data tahun untuk pengelolaan indikator.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 max-w-2xl">
            <form onSubmit={handleSubmit} className="p-6 md:p-8">
              {isFetching ? (
                <div className="animate-pulse flex flex-col gap-4">
                  <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                  <div className="h-10 bg-slate-200 rounded w-full"></div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Tahun
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                        <Calendar size={18} />
                      </div>
                      <input
                        type="number"
                        placeholder="Contoh: 2024"
                        value={tahun}
                        onChange={(e) => setTahun(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-medium"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        navigate("/dashboard/tahun-indikator-perhitungan")
                      }
                      className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={saveMutation.isLoading}
                      className="flex items-center gap-2 px-6 py-2.5 bg-[#2D7344] hover:bg-[#1E5230] text-white text-sm font-semibold rounded-xl transition-all shadow-md active:scale-[0.98] disabled:opacity-50"
                    >
                      <Save size={18} />
                      {saveMutation.isLoading ? "Menyimpan..." : "Simpan Data"}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
};

export default FormTahunIndicator;
