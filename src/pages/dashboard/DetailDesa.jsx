import React, { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { analystSpatialService } from "../../services/master/analystSpatialService";
import { dimensiDesaService } from "../../services/master/dimensiDesaService";
import { potensiDesaService } from "../../services/master/potensiDesaService";
import { intervensiDesaService } from "../../services/master/intervensiDesaService";
import { useAuthReady } from "../../hooks/useAuthReady";
import { Loading } from "../../components/Loading";
import DashboardLayout from "../../components/DashboardLayout";
import DataTable from "../../components/DataTable";
import {
  ChevronLeft,
  MapPin,
  Map,
  TreePine,
  Maximize,
  PieChart,
  Activity,
  Layers,
  MapPinned,
  AlertCircle,
  Tag,
  Info,
  CheckCircle,
  Eye,
  X,
  BookOpen,
} from "lucide-react";

// Helper formatting dipindah keluar dari komponen agar tidak di-recreate setiap kali render
const formatJenisInteraksi = (jenis) => {
  if (!jenis) return "-";
  return jenis
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const renderRuns = (value, emptyLabel = "-") => {
  if (!value) return emptyLabel;

  if (Array.isArray(value)) {
    const isParagraphArray = value.some(
      (item) => item && typeof item === "object" && Array.isArray(item.runs)
    );

    if (isParagraphArray) {
      let numberedCounter = 0;
      const elements = [];

      value.forEach((para, pIdx) => {
        const listType = para?.listType;
        const runs = Array.isArray(para?.runs) ? para.runs : [];
        const validRuns = runs.filter((r) => r.text);
        if (validRuns.length === 0) return;

        if (listType === "numbered") {
          numberedCounter++;
        } else {
          numberedCounter = 0;
        }

        const runContent = validRuns.map((run, rIdx) => {
          if (run.text === "\n") return <br key={rIdx} />;
          let spanNode = (
            <span
              key={rIdx}
              className={`${run.bold ? "font-bold" : ""} ${
                run.italic ? "italic" : ""
              } ${run.underline ? "underline" : ""} ${
                run.strike ? "line-through" : ""
              }`}
              style={{
                color: run.color || undefined,
                fontSize: run.size ? `${run.size}px` : undefined,
              }}
            >
              {run.text}
            </span>
          );

          if (run.subscript) {
            spanNode = <sub key={rIdx} className="text-[0.8em]">{spanNode}</sub>;
          }
          if (run.superscript) {
            spanNode = <sup key={rIdx} className="text-[0.8em]">{spanNode}</sup>;
          }

          return spanNode;
        });

        if (listType === "numbered") {
          elements.push(
            <div key={pIdx} className="flex items-start gap-2 my-1">
              <span className="font-bold text-emerald-700 min-w-[20px] shrink-0 text-right font-mono text-sm">
                {numberedCounter}.
              </span>
              <div className="flex-1 text-slate-800 text-sm">{runContent}</div>
            </div>
          );
        } else if (listType === "bullet") {
          elements.push(
            <div key={pIdx} className="flex items-start gap-2 my-1">
              <span className="font-bold text-emerald-600 shrink-0 text-sm">•</span>
              <div className="flex-1 text-slate-800 text-sm">{runContent}</div>
            </div>
          );
        } else {
          elements.push(
            <div key={pIdx} className="my-1 text-slate-800 text-sm leading-relaxed">
              {runContent}
            </div>
          );
        }
      });

      return elements.length > 0 ? elements : emptyLabel;
    }

    const validRuns = value.filter((run) => run && run.text);
    if (validRuns.length === 0) return emptyLabel;
    return validRuns.map((run, idx) => {
      if (run.text === "\n") return <br key={idx} />;
      let spanNode = (
        <span
          key={idx}
          className={`${run.bold ? "font-bold" : ""} ${run.italic ? "italic" : ""}`}
        >
          {run.text}
        </span>
      );
      if (run.subscript) spanNode = <sub key={idx} className="text-[0.8em]">{spanNode}</sub>;
      if (run.superscript) spanNode = <sup key={idx} className="text-[0.8em]">{spanNode}</sup>;
      return spanNode;
    });
  }

  if (typeof value === "string") return value;
  return emptyLabel;
};

const DesaDetail = () => {
  const { desaId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const isAuthReady = useAuthReady();
  const [activeSectionTab, setActiveSectionTab] = useState("indeks");
  const [selectedLabel, setSelectedLabel] = useState("");
  const [indikatorPage, setIndikatorPage] = useState(1);
  const [selectedIndikatorId, setSelectedIndikatorId] = useState(null);
  const [selectedPotensiCategory, setSelectedPotensiCategory] = useState(null);
  const [selectedIntervensiItem, setSelectedIntervensiItem] = useState(null);

  const { data: desaResponse, isLoading, isError, error } = useQuery({
    queryKey: ["desaDetail", desaId],
    queryFn: () => analystSpatialService.getDesaDetail(desaId),
    enabled: isAuthReady && !!desaId,
  });

  // 1. Fetch Labels (GET /v1/dimensi-desa/labels)
  const { data: labelsResponse, isLoading: isLoadingLabels } = useQuery({
    queryKey: ["dimensiDesaLabels"],
    queryFn: () => dimensiDesaService.getLabels(),
    enabled: isAuthReady,
  });

  const labelsList = labelsResponse?.data || [];
  const activeLabel = selectedLabel || labelsList[0] || "";

  // 2. Fetch List Indikator (GET /v1/dimensi-desa/indikator?nama=...)
  const {
    data: indikatorListResponse,
    isLoading: isLoadingIndikatorList,
    isError: isErrorIndikatorList,
  } = useQuery({
    queryKey: ["dimensiDesaIndikatorList", activeLabel, indikatorPage],
    queryFn: () => dimensiDesaService.getIndikatorByNama(activeLabel, { page: indikatorPage, size: 10 }),
    enabled: isAuthReady && !!activeLabel,
  });

  const indikatorItems = indikatorListResponse?.data?.items || indikatorListResponse?.items || [];
  const indikatorPagination = indikatorListResponse?.data?.pagination || indikatorListResponse?.pagination;

  // 3. Fetch Detail Indikator (GET /v1/dimensi-desa/:id)
  const {
    data: detailIndikatorResponse,
    isLoading: isLoadingDetailIndikator,
    isError: isErrorDetailIndikator,
  } = useQuery({
    queryKey: ["dimensiDesaDetailById", selectedIndikatorId],
    queryFn: () => dimensiDesaService.getDimensiDesaByDesaId(selectedIndikatorId, desaId),
    enabled: isAuthReady && !!selectedIndikatorId,
  });

  const detailData = detailIndikatorResponse?.data || detailIndikatorResponse;

  // 4. Fetch Data Potensi Desa (GET /potensi-desa/:desaId)
  const {
    data: potensiResponse,
    isLoading: isLoadingPotensi,
    isError: isErrorPotensi,
  } = useQuery({
    queryKey: ["potensiDesaDetailByDesa", desaId],
    queryFn: async () => {
      try {
        return await potensiDesaService.getPotensiDetail(desaId);
      } catch (err) {
        if (err?.response?.status === 404) {
          return { data: null };
        }
        throw err;
      }
    },
    enabled: isAuthReady && !!desaId && activeSectionTab === "potensi",
    retry: (failureCount, error) => {
      if (error?.response?.status === 404) return false;
      return failureCount < 2;
    },
  });
  const potensiData = potensiResponse?.data || potensiResponse || null;
  const potensiList = potensiData?.potensi || (Array.isArray(potensiData) ? potensiData : []);

  // 5. Fetch Data Intervensi Desa (GET /intervensi-desa/:desaId)
  const {
    data: intervensiResponse,
    isLoading: isLoadingIntervensi,
    isError: isErrorIntervensi,
  } = useQuery({
    queryKey: ["intervensiDesaDetailByDesa", desaId],
    queryFn: async () => {
      try {
        return await intervensiDesaService.getById(desaId);
      } catch (err) {
        if (err?.response?.status === 404) {
          return { data: null };
        }
        throw err;
      }
    },
    enabled: isAuthReady && !!desaId && activeSectionTab === "intervensi",
    retry: (failureCount, error) => {
      if (error?.response?.status === 404) return false;
      return failureCount < 2;
    },
  });
  const intervensiData = intervensiResponse?.data || intervensiResponse || null;
  const intervensiList = intervensiData?.intervensi || (Array.isArray(intervensiData) ? intervensiData : []);

  const desa = desaResponse;
  const provinceName = location.state?.provinceName || desa?.provinsi || "Provinsi";

  if (isLoading) {
    return (
      <DashboardLayout activeMenu={"Dashboard"}>
        <div className="flex flex-col items-center justify-center h-full py-32">
          <Loading />
          <p className="text-gray-500 mt-4 font-medium">Memuat detail desa...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (isError || !desa) {
    return (
      <DashboardLayout activeMenu={"Dashboard"}>
        <div className="flex flex-col items-center justify-center h-full py-20 px-6">
          <AlertCircle size={48} className="text-amber-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            {isError ? "Gagal Memuat Data" : "Data Tidak Ditemukan"}
          </h2>
          <p className="text-gray-500 mb-6 text-center max-w-sm">
            {isError
              ? error?.message || "Terjadi kesalahan saat mengambil data dari server."
              : "Silakan kembali dan pilih desa dari daftar tabel."}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition"
          >
            Kembali ke Daftar
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const formatJenisInteraksi = (jenis) => {
    if (!jenis) return "-";
    return jenis
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const isMayoritas =
    desa.ringkasanInteraksi?.klasifikasi?.toLowerCase() === "mayoritas";

  const getKlasifikasiBadge = (klasifikasi) => {
    if (!klasifikasi) return "bg-gray-100 text-gray-600 border-gray-200";
    const normalized = klasifikasi.toLowerCase().trim();
    const map = {
      mayoritas: "bg-emerald-50 text-emerald-700 border-emerald-200",
      sebagian_besar: "bg-amber-50 text-amber-700 border-amber-200",
      sebagian_kecil: "bg-amber-50 text-amber-700 border-amber-200",
      irisan_kecil: "bg-red-50 text-red-700 border-red-200",
    };
    return map[normalized] || "bg-gray-100 text-gray-600 border-gray-200";
  };

  const formatKlasifikasi = (klasifikasi) => {
    if (!klasifikasi) return "-";
    const normalized = klasifikasi.toLowerCase().trim();
    const map = {
      sebagian_kecil: "Sedang",
      sebagian_besar: "Besar",
      irisan_kecil: "Kecil",
      mayoritas: "Mayoritas",
    };
    if (map[normalized]) return map[normalized];
    return klasifikasi
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <DashboardLayout activeMenu={"Dashboard"}>
      <main className="flex-1 flex flex-col h-full overflow-y-auto bg-[#F8FAFC] custom-scrollbar">
        <div className="px-6 md:px-10 py-8 max-w-7xl mx-auto w-full space-y-8">

          {/* --- BREADCRUMB & BACK BUTTON --- */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-500 hover:text-emerald-700 font-medium text-sm transition-colors w-fit px-3 py-1.5 -ml-3 rounded-xl hover:bg-emerald-50"
            >
              <ChevronLeft size={18} />
              Kembali ke Daftar Desa {decodeURIComponent(provinceName)}
            </button>
            {desa.kodeKemendagri && (
              <button
                onClick={() => navigate("/dashboard", { state: { flyToKode: desa.kodeKemendagri } })}
                className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 transition-all cursor-pointer font-bold text-sm shrink-0"
              >
                <MapPinned size={16} />
                <span>Lihat pada Peta</span>
              </button>
            )}
          </div>

          {/* --- HERO HEADER --- */}
          <div className="bg-white rounded-[24px] p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-emerald-50/80 to-transparent rounded-bl-[100px] pointer-events-none"></div>

            <div className="flex items-start gap-6 relative z-10">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-emerald-500/20 shrink-0">
                <TreePine size={36} />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                    Desa {typeof desa.nama === 'object' && desa.nama !== null ? desa.nama.nama : desa.nama}
                  </h1>
                  <span className="text-xs font-bold px-3 py-1 bg-gray-100 text-gray-600 rounded-lg border border-gray-200 uppercase tracking-wider">
                    {desa.kodeKemendagri || "NO CODE"}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-gray-500 mt-3">
                  <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-100">
                    <Map size={16} />
                    <span>Kec. {typeof desa.kecamatan === 'object' && desa.kecamatan !== null ? desa.kecamatan.nama : desa.kecamatan}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-purple-50 text-purple-700 px-3 py-1.5 rounded-lg border border-purple-100">
                    <MapPin size={16} />
                    <span>Kab. {typeof desa.kabupaten === 'object' && desa.kabupaten !== null ? desa.kabupaten.nama : desa.kabupaten}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 text-right hidden md:block">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                Status Interaksi
              </p>
              <div
                className={`inline-flex items-center px-4 py-2 rounded-xl border ${getKlasifikasiBadge(
                  desa.ringkasanInteraksi?.klasifikasi
                )}`}
              >
                <span className="font-bold text-lg">
                  {desa.ringkasanInteraksi?.klasifikasi
                    ? formatKlasifikasi(desa.ringkasanInteraksi.klasifikasi)
                    : "Minoritas"}
                </span>
              </div>
            </div>
          </div>

          {/* --- STATISTICS CARDS --- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-center transition-transform hover:-translate-y-1 duration-300 relative overflow-hidden group">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-50 rounded-full blur-2xl group-hover:bg-emerald-100 transition-colors"></div>
              <div className="flex items-center gap-3 mb-4 text-gray-500 relative z-10">
                <div className="p-2.5 bg-emerald-50 rounded-xl">
                  <Maximize size={20} className="text-emerald-600" />
                </div>
                <span className="text-sm font-bold uppercase tracking-wider">
                  Total Luas Desa
                </span>
              </div>
              <div className="text-4xl font-black text-gray-800">
                {desa.luasDesaHa?.toLocaleString() || "0"}{" "}
                <span className="text-lg text-gray-400 font-medium ml-1">Ha</span>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-center transition-transform hover:-translate-y-1 duration-300 relative overflow-hidden group">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-50 rounded-full blur-2xl group-hover:bg-amber-100 transition-colors"></div>
              <div className="flex items-center gap-3 mb-4 text-gray-500 relative z-10">
                <div className="p-2.5 bg-amber-50 rounded-xl">
                  <PieChart size={20} className="text-amber-600" />
                </div>
                <span className="text-sm font-bold uppercase tracking-wider">
                  Luas Kawasan Hutan di Desa
                </span>
              </div>
              <div className="text-4xl font-black text-gray-800">
                {desa.ringkasanInteraksi?.luasIrisanHa?.toLocaleString() || "0"}{" "}
                <span className="text-lg text-gray-400 font-medium ml-1">Ha</span>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-center transition-transform hover:-translate-y-1 duration-300 relative overflow-hidden group">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-indigo-50 rounded-full blur-2xl group-hover:bg-indigo-100 transition-colors"></div>
              <div className="flex items-center gap-3 mb-4 text-gray-500 relative z-10">
                <div className="p-2.5 bg-indigo-50 rounded-xl">
                  <Layers size={20} className="text-indigo-600" />
                </div>
                <span className="text-sm font-bold uppercase tracking-wider">
                  Total Kawasan
                </span>
              </div>
              <div className="text-3xl xl:text-4xl font-black text-gray-800 relative z-10">
                {desa.ringkasanInteraksi?.totalHutan || "0"}
                <span className="text-base xl:text-lg text-gray-400 font-medium ml-1">
                  Titik
                </span>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-center transition-transform hover:-translate-y-1 duration-300 relative overflow-hidden group">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-50 rounded-full blur-2xl group-hover:bg-blue-100 transition-colors"></div>
              <div className="flex items-center gap-3 mb-5 text-gray-500 relative z-10">
                <div className="p-2.5 bg-blue-50 rounded-xl">
                  <Activity size={20} className="text-blue-600" />
                </div>
                <span className="text-sm font-bold uppercase tracking-wider">
                  Rasio Luas Kawasan
                </span>
              </div>
              <div className="relative w-full h-4 bg-gray-100 rounded-full overflow-hidden mb-3">
                <div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${Math.min(desa.ringkasanInteraksi?.persenIrisan || 0, 100)}%`,
                  }}
                />
              </div>
              <div className="flex justify-between items-center text-sm font-bold z-10 relative">
                <span className="text-emerald-600">
                  {desa.ringkasanInteraksi?.persenIrisan || 0}% Kawasan Hutan
                </span>
                <span className="text-gray-400">100%</span>
              </div>
            </div>
          </div>

          {/* --- DETAILED DATA (HUTAN ARRAY) --- */}
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden mb-10">
            <div className="p-6 md:p-8 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-emerald-50 p-3 rounded-2xl">
                  <Layers size={24} className="text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Rincian Kawasan Hutan
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Penjabaran spesifik fungsi kawasan hutan yang berada di desa.
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2">
                <span className="text-sm font-bold text-gray-700">
                  Total: {desa.hutan?.length || 0} Kawasan
                </span>
              </div>
            </div>

            <div className="p-6 md:p-8 bg-[#FAFAFA]">
              {desa.hutan && desa.hutan.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {desa.hutan.map((hutan, idx) => (
                    <div
                      key={idx}
                      className="bg-white p-6 rounded-[20px] border border-gray-100 shadow-sm hover:border-emerald-300 hover:shadow-lg transition-all duration-300 group relative overflow-hidden"
                    >
                      {/* Card Header: icon + nama + badge klasifikasi */}
                      <div className="flex justify-between items-start mb-5">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                            <MapPinned size={18} className="text-emerald-600" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-gray-900 text-sm leading-tight">
                              {hutan.fungsiKawasan || "Kawasan Tidak Diketahui / APL"}
                            </h4>
                            <p className="text-xs text-gray-400 mt-0.5">
                              Kode {hutan.fungsiKawasanKode || "-"}
                            </p>
                          </div>
                        </div>
                        {/* Badge klasifikasi */}
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-lg border shrink-0 ml-2 ${getKlasifikasiBadge(hutan.klasifikasi)}`}
                        >
                          {formatKlasifikasi(hutan.klasifikasi)}
                        </span>
                      </div>

                      {/* Rows */}
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-center py-2 border-b border-gray-50">
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                            Jenis Interaksi
                          </span>
                          <span className="text-[11px] font-bold px-2.5 py-1 bg-gray-50 text-gray-700 rounded-lg border border-gray-100">
                            {formatJenisInteraksi(hutan.jenisInteraksi)}
                          </span>
                        </div>

                        <div className="flex justify-between items-center py-2 border-b border-gray-50">
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                            Luas Irisan
                          </span>
                          <span className="text-sm font-black text-gray-800">
                            {hutan.luasIrisanHa?.toLocaleString() || "0"}{" "}
                            <span className="text-gray-400 font-medium">Ha</span>
                          </span>
                        </div>

                        {/* Progress bar persentase */}
                        <div className="pt-2">
                          <div className="flex justify-between text-xs font-bold mb-1.5">
                            <span className="text-gray-400 uppercase tracking-wider">
                              Persentase
                            </span>
                            <span className="text-emerald-600">
                              {hutan.persenIrisan || 0}%
                            </span>
                          </div>
                          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-700"
                              style={{
                                width: `${Math.min(hutan.persenIrisan || 0, 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 flex flex-col items-center justify-center text-center bg-white rounded-3xl border border-dashed border-gray-200">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-5">
                    <TreePine size={40} className="text-gray-300" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    Tidak Ada Data Rincian
                  </h3>
                  <p className="text-sm text-gray-500 max-w-sm mx-auto">
                    Tidak ditemukan data rincian spesifik mengenai kawasan hutan untuk desa ini.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* --- DATA SECTION WITH 3 ACTIVE TABS --- */}
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden mb-10">
            {/* TAB BAR NAVIGATION */}
            <div className="border-b border-gray-100 bg-[#FAFAFA] p-3 flex flex-wrap items-center gap-2 font-sans">
              <button
                type="button"
                onClick={() => setActiveSectionTab("indeks")}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                  activeSectionTab === "indeks"
                    ? "bg-white text-emerald-700 shadow-sm border border-gray-100"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-100/60"
                }`}
              >
                <BookOpen size={18} className={activeSectionTab === "indeks" ? "text-emerald-600" : "text-gray-400"} />
                <span>Data Indeks</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSectionTab("potensi")}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                  activeSectionTab === "potensi"
                    ? "bg-white text-emerald-700 shadow-sm border border-gray-100"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-100/60"
                }`}
              >
                <Tag size={18} className={activeSectionTab === "potensi" ? "text-emerald-600" : "text-gray-400"} />
                <span>Data Potensi</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSectionTab("intervensi")}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                  activeSectionTab === "intervensi"
                    ? "bg-white text-emerald-700 shadow-sm border border-gray-100"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-100/60"
                }`}
              >
                <Activity size={18} className={activeSectionTab === "intervensi" ? "text-emerald-600" : "text-gray-400"} />
                <span>Data Intervensi</span>
              </button>
            </div>

            {/* TAB CONTENT 1: DATA INDEKS */}
            {activeSectionTab === "indeks" && (
              <div>
                <div className="p-6 md:p-8 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-emerald-50 p-3 rounded-2xl">
                      <BookOpen size={24} className="text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        Data Indeks
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Rekapitulasi indikator dan rincian dimensi.
                      </p>
                    </div>
                  </div>

                  {/* Dropdown Labels */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider hidden sm:inline">Label:</span>
                    <select
                      value={activeLabel}
                      onChange={(e) => {
                        setSelectedLabel(e.target.value);
                        setIndikatorPage(1);
                      }}
                      disabled={isLoadingLabels}
                      className="bg-[#F8FAFC] border border-gray-200 text-gray-800 text-xs sm:text-sm font-extrabold rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all cursor-pointer shadow-sm min-w-[200px]"
                    >
                      {labelsList.map((labelItem, idx) => (
                        <option key={idx} value={labelItem}>
                          {labelItem}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="p-6 md:p-8 bg-[#FAFAFA]">
                  <DataTable
                    columns={[
                      {
                        header: "NO",
                        className: "w-16 text-center",
                        render: (row, idx) => {
                          const currentPage = indikatorPagination?.currentPage || indikatorPage;
                          const perPage = indikatorPagination?.perPage || 10;
                          return <span className="font-bold text-gray-400">{(currentPage - 1) * perPage + idx + 1}</span>;
                        },
                      },
                      {
                        header: "NAMA INDIKATOR",
                        render: (row) => <span className="font-extrabold text-slate-900">{row.nama || "-"}</span>,
                      },
                      {
                        header: "TAHUN",
                        render: (row) => (
                          <span className="font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-100/80 px-2.5 py-1 rounded-lg text-xs">
                            {row.tahunIndikatorDimensi?.tahun || row.tahun || "-"}
                          </span>
                        ),
                      },
                      {
                        header: "AKSI",
                        className: "text-center w-24",
                        render: (row) => (
                          <div className="flex justify-center">
                            <button
                              onClick={() => setSelectedIndikatorId(row.id)}
                              className="p-2 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg transition-colors cursor-pointer"
                              title="Lihat Detail Indikator"
                            >
                              <Eye size={16} strokeWidth={2.5} />
                            </button>
                          </div>
                        ),
                      },
                    ]}
                    data={indikatorItems}
                    isLoading={isLoadingIndikatorList || isLoadingLabels}
                    isError={isErrorIndikatorList}
                    emptyMessage="Tidak ada data indikator dimensi desa untuk label ini."
                  />

                  {/* Pagination Controls */}
                  {indikatorPagination && indikatorPagination.totalPage > 1 && (
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200/60">
                      <span className="text-xs text-gray-500 font-semibold">
                        Menampilkan <span className="font-extrabold text-gray-800">{indikatorItems.length}</span> dari <span className="font-extrabold text-gray-800">{indikatorPagination.total}</span> data
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setIndikatorPage(prev => Math.max(prev - 1, 1))}
                          disabled={indikatorPage <= 1}
                          className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-gray-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                          Sebelumnya
                        </button>
                        <span className="px-3 py-1 text-xs font-extrabold text-gray-700">
                          {indikatorPage} / {indikatorPagination.totalPage}
                        </span>
                        <button
                          onClick={() => setIndikatorPage(prev => Math.min(prev + 1, indikatorPagination.totalPage))}
                          disabled={indikatorPage >= indikatorPagination.totalPage}
                          className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-gray-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                          Selanjutnya
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT 2: DATA POTENSI */}
            {activeSectionTab === "potensi" && (
              <div>
                <div className="p-6 md:p-8 border-b border-gray-100 flex items-center gap-4">
                  <div className="bg-emerald-50 p-3 rounded-2xl">
                    <Tag size={24} className="text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Data Potensi Desa
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Kategori potensi ekonomi, pariwisata, lingkungan, dan infrastruktur desa.
                    </p>
                  </div>
                </div>

                <div className="p-6 md:p-8 bg-[#FAFAFA]">
                  <DataTable
                    columns={[
                      {
                        header: "NO",
                        className: "w-16 text-center",
                        render: (_, idx) => <span className="font-bold text-gray-400">{idx + 1}</span>,
                      },
                      {
                        header: "KATEGORI POTENSI",
                        render: (row) => (
                          <span className="font-extrabold text-slate-900">
                            {row.kategori || row.header || "Kategori Potensi"}
                          </span>
                        ),
                      },
                      {
                        header: "JUMLAH SUB-POTENSI",
                        render: (row) => (
                          <span className="font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-lg text-xs font-mono">
                            {row.sub?.length || 0} Sub-Potensi
                          </span>
                        ),
                      },
                      {
                        header: "AKSI",
                        className: "text-center w-24",
                        render: (row) => (
                          <div className="flex justify-center">
                            <button
                              onClick={() => setSelectedPotensiCategory(row)}
                              className="p-2 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg transition-colors cursor-pointer"
                              title="Lihat Detail Potensi"
                            >
                              <Eye size={16} strokeWidth={2.5} />
                            </button>
                          </div>
                        ),
                      },
                    ]}
                    data={potensiList}
                    isLoading={isLoadingPotensi}
                    isError={isErrorPotensi}
                    emptyMessage="Belum ada data potensi desa yang tercatat untuk desa ini."
                  />
                </div>
              </div>
            )}

            {/* TAB CONTENT 3: DATA INTERVENSI */}
            {activeSectionTab === "intervensi" && (
              <div>
                <div className="p-6 md:p-8 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-emerald-50 p-3 rounded-2xl">
                      <Activity size={24} className="text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        Data Intervensi Desa
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Program dan bantuan intervensi desa per tahun.
                      </p>
                    </div>
                  </div>
                  {intervensiData?.tahunIntervensiDesa?.tahun && (
                    <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3.5 py-2 rounded-xl w-fit">
                      Tahun {intervensiData.tahunIntervensiDesa.tahun}
                    </span>
                  )}
                </div>

                <div className="p-6 md:p-8 bg-[#FAFAFA]">
                  <DataTable
                    columns={[
                      {
                        header: "NO",
                        className: "w-16 text-center",
                        render: (_, idx) => <span className="font-bold text-gray-400">{idx + 1}</span>,
                      },
                      {
                        header: "PROGRAM INTERVENSI / HEADER",
                        render: (row) => (
                          <span className="font-extrabold text-slate-900">
                            {row.header || "Program Intervensi"}
                          </span>
                        ),
                      },
                      {
                        header: "AKSI",
                        className: "text-center w-24",
                        render: (row) => (
                          <div className="flex justify-center">
                            <button
                              onClick={() => setSelectedIntervensiItem(row)}
                              className="p-2 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg transition-colors cursor-pointer"
                              title="Lihat Rincian Program"
                            >
                              <Eye size={16} strokeWidth={2.5} />
                            </button>
                          </div>
                        ),
                      },
                    ]}
                    data={intervensiList}
                    isLoading={isLoadingIntervensi}
                    isError={isErrorIntervensi}
                    emptyMessage="Belum ada data program intervensi desa yang tercatat untuk desa ini."
                  />
                </div>
              </div>
            )}
          </div>

        </div>
      </main>

      {/* MODAL DETAIL INDIKATOR DIMENSI DESA (/v1/dimensi-desa/:id/desa/:desaId) */}
      {selectedIndikatorId && (() => {
        const metadataItem = detailData?.metadata?.[0];
        const detailItem = detailData?.detail?.[0];
        const nilaiList = detailItem?.dimensi || [];
        const selectedIndikatorItem = indikatorItems.find((item) => item.id === selectedIndikatorId);

        const formatNilai = (val) => {
          const num = Number(val);
          return !isNaN(num) && val !== "" && val !== null ? num.toFixed(2) : val;
        };

        // Extract highlight cards
        const idmStatus = nilaiList.find(n => n.kode?.toLowerCase().includes("status") || n.nama?.toLowerCase().includes("status")) || (nilaiList.length > 0 ? nilaiList[0] : null);
        const idmNilai = nilaiList.find(n => n.kode?.toLowerCase().includes("nilai") || n.kode?.toLowerCase().includes("skor") || n.nama?.toLowerCase().includes("skor")) || (nilaiList.length > 1 ? nilaiList[1] : null);

        const remainingDims = nilaiList.filter(n => n !== idmStatus && n !== idmNilai);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#F8FAFC] rounded-[32px] shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-200/50 animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
              {/* Emerald Accent Header */}
              <div className="h-1.5 bg-gradient-to-r from-emerald-600 to-[#10B981]" />

              {/* Header */}
              <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white">
                <div>
                  <span className="text-[10px] font-bold px-2.5 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-lg uppercase tracking-wider">
                    Rincian Dimensi Pembangunan
                  </span>
                  <h3 className="text-xl font-bold text-slate-800 mt-1.5">
                    {selectedIndikatorItem?.nama || "Detail Indikator Dimensi"}
                  </h3>
                </div>
                <div className="flex items-center gap-3">
                  {metadataItem?.tahun && (
                    <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-100/80 px-3 py-1.5 rounded-lg">
                      Tahun {metadataItem.tahun}
                    </span>
                  )}
                  <button
                    onClick={() => setSelectedIndikatorId(null)}
                    className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-2xl transition-colors cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
                {isLoadingDetailIndikator ? (
                  <div className="py-20 flex flex-col items-center justify-center">
                    <Loading />
                    <p className="text-sm font-bold text-slate-500 mt-4">Memuat detail dimensi desa...</p>
                  </div>
                ) : isErrorDetailIndikator ? (
                  <div className="py-16 text-center text-red-500 font-bold">
                    Gagal memuat rincian indikator dimensi dari server.
                  </div>
                ) : nilaiList.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left Column: Highlight Cards */}
                    <div className="lg:col-span-5 space-y-6">
                      <div className="bg-gradient-to-tr from-[#0C2A18] to-[#164E2A] rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
                        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]" />
                        <span className="text-[9px] font-bold text-emerald-300 uppercase tracking-widest bg-emerald-950/40 border border-emerald-700/30 px-2.5 py-1 rounded-md inline-block mb-3 leading-none">
                          Fokus Utama
                        </span>
                        <h4 className="text-base font-bold text-emerald-100">Evaluasi Pembangunan</h4>
                        <p className="text-[11px] text-emerald-200/70 mt-1 leading-relaxed">
                          Data ini mencerminkan kondisi sosial ekonomi berdasarkan klasifikasi IDM Kementerian Desa.
                        </p>
                      </div>

                      {/* Highlight Card: IDM Status */}
                      {idmStatus && (
                        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-center relative overflow-hidden group">
                          <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-50 rounded-full blur-2xl group-hover:bg-emerald-100 transition-colors" />
                          <div className="flex items-center gap-2.5 text-slate-400 mb-3 relative z-10">
                            <CheckCircle size={16} className="text-emerald-600" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">{idmStatus.nama}</span>
                          </div>
                          <div className="text-2xl font-black text-emerald-800 relative z-10 uppercase tracking-tight">
                            {idmStatus.nilai}
                          </div>
                        </div>
                      )}

                      {/* Highlight Card: IDM Nilai */}
                      {idmNilai && (
                        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-center relative overflow-hidden group">
                          <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-50 rounded-full blur-2xl group-hover:bg-blue-100 transition-colors" />
                          <div className="flex items-center gap-2.5 text-slate-400 mb-3 relative z-10">
                            <Activity size={16} className="text-blue-600" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">{idmNilai.nama}</span>
                          </div>
                          <div className="text-4xl font-black text-slate-800 relative z-10 flex items-baseline">
                            {formatNilai(idmNilai.nilai)}
                            <span className="text-xs text-slate-400 font-bold ml-1">Poin</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right Column: Other Dimensions Grid */}
                    <div className="lg:col-span-7 space-y-4">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                        Dimensi Pendukung Lainnya ({remainingDims.length})
                      </h4>

                      {remainingDims.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4">
                          {remainingDims.map((dim, idx) => {
                            const numericNilai = Number(dim.nilai);
                            const isNumeric = dim.nilai !== null && dim.nilai !== "" && !isNaN(numericNilai);
                            // Skala 0-1 (mis. 0.x) dikonversi ke persen; skala puluhan (0-100) dipakai langsung
                            const percentValue = numericNilai > 0 && numericNilai < 1 ? numericNilai * 100 : numericNilai;
                            return (
                              <div
                                key={idx}
                                className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between gap-4 hover:border-emerald-200 transition-colors duration-300"
                              >
                                <div className="space-y-1">
                                  <span className="text-[9px] font-bold text-slate-400 font-mono tracking-widest block uppercase">
                                    {dim.kode}
                                  </span>
                                  <span className="text-sm font-bold text-slate-700 leading-tight block">
                                    {dim.nama}
                                  </span>
                                </div>

                                <div className="text-right shrink-0">
                                  {isNumeric ? (
                                    <div className="flex flex-col items-end gap-1">
                                      <span className="text-sm font-black text-slate-800 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                                        {numericNilai.toFixed(2)}
                                      </span>
                                      <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                                        <div
                                          className="h-full bg-emerald-500 rounded-full"
                                          style={{ width: `${Math.min(Math.max(percentValue, 0), 100)}%` }}
                                        />
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="text-xs font-bold px-3 py-1.5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl uppercase tracking-wider">
                                      {dim.nilai}
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="py-12 flex flex-col items-center justify-center text-center text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200">
                          <Info size={28} className="mb-2 text-slate-300" />
                          <p className="text-sm font-bold">Hanya data IDM utama yang tersedia</p>
                          <p className="text-xs mt-0.5">Tidak ada dimensi pendukung tambahan.</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="py-20 flex flex-col items-center justify-center text-center text-slate-400 bg-white rounded-[32px] border border-dashed border-slate-200">
                    <Info size={40} className="mb-4 text-slate-300 animate-pulse" />
                    <h4 className="text-lg font-bold text-slate-700">Tidak ada rincian data</h4>
                    <p className="text-sm text-slate-500 max-w-xs mt-1">Rincian dimensi pembangunan desa untuk indikator ini belum tersedia.</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-8 py-5 border-t border-slate-100 flex justify-end bg-white">
                <button
                  onClick={() => setSelectedIndikatorId(null)}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 rounded-xl transition-colors cursor-pointer"
                >
                  Tutup Rincian
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL DETAIL POTENSI CATEGORY */}
      {selectedPotensiCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#F8FAFC] rounded-[32px] shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200/50 animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
            <div className="h-1.5 bg-gradient-to-r from-emerald-600 to-[#10B981]" />

            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white">
              <div>
                <span className="text-[10px] font-bold px-2.5 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-lg uppercase tracking-wider font-mono">
                  Detail Potensi Desa
                </span>
                <h3 className="text-xl font-bold text-slate-800 mt-1.5">
                  {selectedPotensiCategory.kategori || selectedPotensiCategory.header || "Detail Potensi"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPotensiCategory(null)}
                className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-2xl transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 overflow-y-auto custom-scrollbar flex-1 space-y-4">
              {selectedPotensiCategory.sub && selectedPotensiCategory.sub.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedPotensiCategory.sub.map((subItem, subIdx) => (
                    <div
                      key={subIdx}
                      className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between"
                    >
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                          Nama Indikator / Sub-Potensi
                        </span>
                        <h5 className="font-bold text-slate-800 text-sm mt-1 leading-snug">
                          {subItem.nama}
                        </h5>
                      </div>

                      <div className="mt-5 pt-3 border-t border-slate-50 flex justify-between items-end">
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                            Satuan
                          </span>
                          <span className="block text-xs font-semibold text-slate-500 mt-0.5">
                            {subItem.unit || "-"}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider font-mono block mb-0.5">
                            Nilai
                          </span>
                          <span className="text-base font-black text-slate-800 font-mono bg-slate-50 border border-slate-100 px-3 py-1 rounded-xl">
                            {subItem.nilai ?? "-"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200">
                  <Info size={32} className="mb-2.5 text-slate-300 mx-auto" />
                  <p className="text-xs font-bold text-slate-500">
                    Kategori ini belum memiliki rincian sub-potensi.
                  </p>
                </div>
              )}
            </div>

            <div className="px-8 py-5 border-t border-slate-100 flex justify-end bg-white">
              <button
                type="button"
                onClick={() => setSelectedPotensiCategory(null)}
                className="px-6 py-2.5 text-xs font-black text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETAIL INTERVENSI ITEM */}
      {selectedIntervensiItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#F8FAFC] rounded-[32px] shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200/50 animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
            <div className="h-1.5 bg-gradient-to-r from-emerald-600 to-[#10B981]" />

            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white">
              <div>
                <span className="text-[10px] font-bold px-2.5 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-lg uppercase tracking-wider font-mono">
                  Detail Program Intervensi
                </span>
                <h3 className="text-xl font-bold text-slate-800 mt-1.5">
                  {selectedIntervensiItem.header || "Program Intervensi"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedIntervensiItem(null)}
                className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-2xl transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-white">
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono block mb-3">
                  Rincian Deskripsi Program
                </span>
                <div className="text-slate-800">
                  {renderRuns(selectedIntervensiItem.value)}
                </div>
              </div>
            </div>

            <div className="px-8 py-5 border-t border-slate-100 flex justify-end bg-white">
              <button
                type="button"
                onClick={() => setSelectedIntervensiItem(null)}
                className="px-6 py-2.5 text-xs font-black text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default DesaDetail;
