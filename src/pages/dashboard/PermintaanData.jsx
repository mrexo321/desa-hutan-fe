import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  FileSpreadsheet,
  Check,
  X,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Search,
  Loader2,
  Inbox,
  AlertCircle,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Info,
} from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import { performaDesaService } from "../../services/master/performaDesaService";

// ── Status config ──
const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    icon: Clock,
    className: "bg-yellow-50 text-yellow-600 border-yellow-100",
  },
  approved: {
    label: "Disetujui",
    icon: CheckCircle2,
    className: "bg-green-50 text-[#2D7344] border-green-100",
  },
  rejected: {
    label: "Ditolak",
    icon: XCircle,
    className: "bg-red-50 text-red-600 border-red-100",
  },
  failed: {
    label: "Gagal",
    icon: AlertTriangle,
    className: "bg-orange-50 text-orange-600 border-orange-100",
  },
};

const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = config.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${config.className}`}
    >
      <Icon size={12} />
      {config.label}
    </span>
  );
};

// ── Helpers ──
const extractWilayahName = (val) => {
  if (!val) return null;
  if (typeof val === "string") return val;
  if (typeof val === "object") {
    return val.nama || val.name || val.label || null;
  }
  return null;
};

const getProvinsiName = (filters) => {
  if (!filters) return null;
  if (filters.provinsi) return extractWilayahName(filters.provinsi);
  if (filters.provinsiNama) return filters.provinsiNama;
  if (filters.provinsiId) return `Prov: ${String(filters.provinsiId).substring(0, 8)}...`;
  return null;
};

const getKabupatenName = (filters) => {
  if (!filters) return null;
  if (filters.kabupaten) return extractWilayahName(filters.kabupaten);
  if (filters.kabupatenNama) return filters.kabupatenNama;
  if (filters.kabupatenId) return `Kab: ${String(filters.kabupatenId).substring(0, 8)}...`;
  return null;
};

const getKecamatanName = (filters) => {
  if (!filters) return null;
  if (filters.kecamatan) return extractWilayahName(filters.kecamatan);
  if (filters.kecamatanNama) return filters.kecamatanNama;
  if (filters.kecamatanId) return `Kec: ${String(filters.kecamatanId).substring(0, 8)}...`;
  return null;
};

const getDesaName = (filters) => {
  if (!filters) return null;
  if (filters.desa) return extractWilayahName(filters.desa);
  if (filters.desaNama) return filters.desaNama;
  if (filters.desaId) return `Desa: ${String(filters.desaId).substring(0, 8)}...`;
  return null;
};

const getWilayahLabel = (filters) => {
  if (!filters) return "-";
  const tingkat = String(filters.tingkatAdministrasi || filters.tingkat_administrasi || "").toLowerCase();

  if (tingkat === "nasional") {
    return "-";
  }

  if (tingkat === "provinsi") {
    return getProvinsiName(filters) || "-";
  }

  if (tingkat === "kabupaten") {
    return getKabupatenName(filters) || "-";
  }

  if (tingkat === "kecamatan") {
    return getKecamatanName(filters) || "-";
  }

  if (tingkat === "desa") {
    return getDesaName(filters) || "-";
  }

  // Fallback jika tingkatAdministrasi tidak terdefinisi:
  const kec = getKecamatanName(filters);
  if (kec) return kec;
  const kab = getKabupatenName(filters);
  if (kab) return kab;
  const prov = getProvinsiName(filters);
  if (prov) return prov;
  const desa = getDesaName(filters);
  if (desa) return desa;

  return "-";
};

const formatJenisDataBadges = (jenisData) => {
  if (!jenisData || !Array.isArray(jenisData) || jenisData.length === 0) {
    return <span className="text-gray-400 font-mono text-[11px]">-</span>;
  }
  return (
    <div className="flex flex-wrap gap-1 items-center">
      {jenisData.map((item, i) => (
        <span
          key={i}
          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
            item.tipe === "indexDesa"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-blue-50 text-blue-700 border-blue-200"
          }`}
        >
          {item.tipe === "indexDesa" ? "Index Desa" : "Indikator Desa"}
        </span>
      ))}
    </div>
  );
};

export default function PermintaanData() {
  const queryClient = useQueryClient();
  const user = useSelector((state) => state.user);

  // Check roles
  const userRoles = user?.roles || [];
  const isAdmin =
    userRoles.includes("admin") ||
    userRoles.includes("superadmin") ||
    userRoles.includes("Superadmin") ||
    userRoles.includes("super-admin");

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [rejectingReqId, setRejectingReqId] = useState(null);
  const [approvingReqId, setApprovingReqId] = useState(null);
  const [alasanReject, setAlasanReject] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Pagination & Filter State
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState("all");

  // ── Fetch all requests for stats and listing ──
  const { data: allRequestsRes, isLoading, isError, refetch } = useQuery({
    queryKey: ["request-excel-all-stats"],
    queryFn: () => performaDesaService.getAllRequestExcel({ page: 1, size: 1000 }),
  });

  const allRequests = React.useMemo(() => {
    return allRequestsRes?.data?.items || allRequestsRes?.items || [];
  }, [allRequestsRes]);

  // ── Client-side search & status filter ──
  const filteredRequests = React.useMemo(() => {
    let list = [...allRequests];

    // Filter by user role (normal user sees only their own request)
    if (!isAdmin) {
      const userEmail = String(user?.username || user?.email || "").toLowerCase();
      list = list.filter((r) => String(r.email).toLowerCase() === userEmail);
    }

    // Apply search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((r) => {
        const namaVal = String(r.nama || "").toLowerCase();
        const hpVal = String(r.no_hp || r.noHp || "").toLowerCase();
        const emailVal = String(r.email || "").toLowerCase();
        const statusVal = String(r.status || "").toLowerCase();
        const tahunVal = String(r.filters?.tahun || "").toLowerCase();
        const exportType = String(r.export_type || "").toLowerCase();
        const tingkatVal = String(r.filters?.tingkatAdministrasi || r.filters?.tingkat_administrasi || "").toLowerCase();
        const prov = String(getProvinsiName(r.filters) || "").toLowerCase();
        const kab = String(getKabupatenName(r.filters) || "").toLowerCase();
        const kec = String(getKecamatanName(r.filters) || "").toLowerCase();
        const desa = String(getDesaName(r.filters) || "").toLowerCase();

        return (
          namaVal.includes(q) ||
          hpVal.includes(q) ||
          emailVal.includes(q) ||
          statusVal.includes(q) ||
          tahunVal.includes(q) ||
          exportType.includes(q) ||
          tingkatVal.includes(q) ||
          prov.includes(q) ||
          kab.includes(q) ||
          kec.includes(q) ||
          desa.includes(q)
        );
      });
    }

    // Apply status filter
    if (statusFilter !== "all") {
      list = list.filter((r) => r.status === statusFilter);
    }

    return list;
  }, [allRequests, isAdmin, user, searchQuery, statusFilter]);

  // ── Pagination ──
  const pagination = React.useMemo(() => {
    const total = filteredRequests.length;
    const totalPages = Math.ceil(total / size) || 1;
    return {
      total,
      totalPages,
      currentPage: page,
      perPage: size,
    };
  }, [filteredRequests, size, page]);

  const paginatedRequests = React.useMemo(() => {
    const startIdx = (page - 1) * size;
    return filteredRequests.slice(startIdx, startIdx + size);
  }, [filteredRequests, page, size]);

  // ── Statistics ──
  const stats = React.useMemo(() => {
    const list = isAdmin
      ? allRequests
      : allRequests.filter(
          (r) =>
            String(r.email).toLowerCase() ===
            String(user?.username || user?.email || "").toLowerCase()
        );

    return {
      total: list.length,
      pending: list.filter((r) => r.status === "pending").length,
      approved: list.filter((r) => r.status === "approved").length,
      rejected: list.filter((r) => r.status === "rejected").length,
      failed: list.filter((r) => r.status === "failed").length,
    };
  }, [allRequests, isAdmin, user]);

  // ── Mutations ──
  const approveMutation = useMutation({
    mutationFn: (id) => performaDesaService.approveRequestExcel(id, {}),
    onSuccess: () => {
      toast.success("Permintaan data berhasil disetujui!");
      queryClient.invalidateQueries({ queryKey: ["request-excel-list"] });
      queryClient.invalidateQueries({ queryKey: ["request-excel-all-stats"] });
      refetch();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Gagal menyetujui permintaan.");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, alasan }) =>
      performaDesaService.rejectRequestExcel(id, {
        reject_reason: alasan,
        message: alasan,
      }),
    onSuccess: () => {
      toast.success("Permintaan data berhasil ditolak.");
      setRejectingReqId(null);
      setAlasanReject("");
      queryClient.invalidateQueries({ queryKey: ["request-excel-list"] });
      queryClient.invalidateQueries({ queryKey: ["request-excel-all-stats"] });
      refetch();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Gagal menolak permintaan.");
    },
  });

  const handleRejectSubmit = (e) => {
    e.preventDefault();
    if (!alasanReject.trim()) {
      toast.warning("Alasan penolakan wajib diisi!");
      return;
    }
    rejectMutation.mutate({ id: rejectingReqId, alasan: alasanReject.trim() });
  };

  const colCount = 10;

  return (
    <DashboardLayout activeMenu="Permintaan Data">
      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-[#FAFBFC]">
        <div className="flex-1 overflow-y-auto px-6 md:px-10 py-8 custom-scrollbar">

          {/* HEADER */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#0B241A] to-[#1E5230] p-6 rounded-3xl text-white shadow-lg shadow-green-950/10 relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
            <div className="flex items-center gap-4 z-10">
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-[#00C47C] shadow-inner border border-white/10 shrink-0">
                <FileSpreadsheet size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight">Permintaan Data Desa</h1>
                <p className="text-xs font-semibold text-green-200/80 mt-1 uppercase tracking-wider">
                  {isAdmin
                    ? "Kelola, setujui, dan tolak permintaan ekspor data desa dari pengguna"
                    : "Pantau status permohonan data desa Anda dan unduh file hasil ekspor"}
                </p>
              </div>
            </div>
          </div>

          {/* STATISTIK */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8 font-sans">
            <StatCard label="Total Permintaan" value={stats.total} color="text-gray-900" />
            <StatCard label="Menunggu Persetujuan" value={stats.pending} color="text-yellow-600" />
            <StatCard label="Disetujui" value={stats.approved} color="text-[#2D7344]" />
            <StatCard label="Ditolak" value={stats.rejected} color="text-red-500" />
            <StatCard label="Gagal" value={stats.failed} color="text-orange-500" />
          </div>

          {/* INFO BOX */}
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex gap-3 text-xs text-[#2d7344] font-semibold font-sans">
            <Info size={18} className="shrink-0 mt-0.5" />
            <p>
              Daftar seluruh permohonan data ekspor desa. Gunakan pencarian dan filter status di bawah ini untuk melihat detail permohonan dan menyetujui/menolak antrean data.
            </p>
          </div>

          {/* CARD UTAMA */}
          <div className="bg-white rounded-3xl shadow-[0_4px_25px_rgba(0,0,0,0.02)] border border-gray-100 flex flex-col overflow-hidden">
            {/* Toolbar */}
            <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4 font-sans">
              <div className="flex flex-col gap-2">
                <h2 className="text-lg font-bold text-gray-800">Daftar Permintaan Ekspor</h2>
                <div className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-xl w-fit flex-wrap">
                  {[
                    { value: "all", label: "Semua" },
                    { value: "pending", label: "Pending" },
                    { value: "approved", label: "Disetujui" },
                    { value: "rejected", label: "Ditolak" },
                    { value: "failed", label: "Gagal" },
                  ].map((tab) => (
                    <button
                      key={tab.value}
                      type="button"
                      onClick={() => {
                        setStatusFilter(tab.value);
                        setPage(1);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        statusFilter === tab.value
                          ? "bg-white text-[#2D7344] shadow-sm"
                          : "text-gray-500 hover:text-gray-800"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-72 group">
                  <Search
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#2D7344] transition-colors"
                    size={16}
                  />
                  <input
                    type="text"
                    placeholder="Cari nama, email, hp, wilayah, tahun..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setPage(1);
                    }}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-green-500/10 focus:border-[#2D7344] transition-all font-semibold"
                  />
                </div>
                <select
                  value={size}
                  onChange={(e) => {
                    setSize(parseInt(e.target.value));
                    setPage(1);
                  }}
                  className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-600 focus:outline-none focus:border-[#2D7344] focus:ring-2 focus:ring-green-500/10 transition-all cursor-pointer"
                >
                  {[5, 10, 25, 50].map((s) => (
                    <option key={s} value={s}>
                      {s} baris
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto w-full font-sans">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-[10px] uppercase tracking-wider font-bold text-gray-500">
                    <th className="py-4 px-6 w-12 text-center">No</th>
                    <th className="py-4 px-6">Tanggal Permintaan</th>
                    <th className="py-4 px-6">Pemohon</th>
                    <th className="py-4 px-6">Tipe Ekspor</th>
                    <th className="py-4 px-6 text-center">Tahun</th>
                    <th className="py-4 px-6">Tingkat Daerah</th>
                    <th className="py-4 px-6">Detail Wilayah</th>
                    <th className="py-4 px-6">Jenis Data</th>
                    <th className="py-4 px-6 text-center">Status</th>
                    <th className="py-4 px-6 text-center w-28">Aksi</th>
                  </tr>
                </thead>
                <tbody className="text-xs font-semibold text-gray-700">
                  {isLoading ? (
                    <tr>
                      <td colSpan={colCount} className="py-12 text-center text-gray-400">
                        <div className="flex justify-center items-center gap-2 text-[#2D7344]">
                          <Loader2 className="animate-spin" size={18} />
                          <span>Memuat daftar permintaan...</span>
                        </div>
                      </td>
                    </tr>
                  ) : isError ? (
                    <tr>
                      <td colSpan={colCount} className="py-12 text-center text-red-500">
                        Gagal memuat data permintaan. Silakan hubungi admin.
                      </td>
                    </tr>
                  ) : paginatedRequests.length === 0 ? (
                    <tr>
                      <td colSpan={colCount} className="py-16 text-center text-gray-400">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <Inbox size={40} className="text-gray-300" />
                          <p className="text-sm font-medium">Belum ada data permintaan.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedRequests.map((item, idx) => {
                      const filters = item.filters || {};
                      const exportType = (item.export_type || "-")
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (c) => c.toUpperCase());
                      const createdDate = item.createdAt
                        ? new Date(item.createdAt).toLocaleString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "-";
                      const tingkatVal = filters.tingkatAdministrasi || filters.tingkat_administrasi || "-";
                      const noHpVal = item.no_hp || item.noHp || "";

                      return (
                        <tr key={item.id} className="border-b border-gray-50 hover:bg-[#F9FBFA] transition-colors">
                          <td className="py-4 px-6 text-center font-mono text-gray-400">
                            {(page - 1) * size + idx + 1}
                          </td>
                          <td className="py-4 px-6 text-gray-600 font-medium">
                            {createdDate}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex flex-col">
                              <span className="font-extrabold text-gray-900">{item.nama || item.email || "-"}</span>
                              {item.nama && item.email && (
                                <span className="text-gray-500 font-medium text-[11px]">{item.email}</span>
                              )}
                              {noHpVal && (
                                <span className="text-emerald-700 font-mono text-[10px] font-bold">{noHpVal}</span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-6 font-bold text-gray-800">{exportType}</td>
                          <td className="py-4 px-6 text-center font-mono font-bold text-gray-600">
                            {filters.tahun || "-"}
                          </td>
                          <td className="py-4 px-6 font-extrabold text-slate-700 capitalize">
                            {tingkatVal}
                          </td>
                          <td className="py-4 px-6 text-gray-600 font-medium">
                            {getWilayahLabel(filters)}
                          </td>
                          <td className="py-4 px-6">
                            {formatJenisDataBadges(filters.jenisData)}
                          </td>
                          <td className="py-4 px-6 text-center">
                            <StatusBadge status={item.status} />
                          </td>
                          <td className="py-4 px-6 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* View detail */}
                              <button
                                onClick={() => setSelectedRequest(item)}
                                className="p-1.5 text-gray-400 hover:text-[#2D7344] hover:bg-[#EAFBF0] rounded-lg transition-colors cursor-pointer"
                                title="Lihat Detail"
                              >
                                <Eye size={16} />
                              </button>

                              {/* Admin actions: approve / reject */}
                              {isAdmin && item.status === "pending" && (
                                <>
                                  <button
                                    onClick={() => setApprovingReqId(item.id)}
                                    className="p-1.5 text-white bg-[#00C47C] hover:bg-[#00a86b] rounded-lg transition-all shadow-xs flex items-center justify-center cursor-pointer"
                                    title="Setujui"
                                  >
                                    <Check size={14} strokeWidth={2.5} />
                                  </button>
                                  <button
                                    onClick={() => setRejectingReqId(item.id)}
                                    className="p-1.5 text-white bg-red-500 hover:bg-red-600 rounded-lg transition-all shadow-xs flex items-center justify-center cursor-pointer"
                                    title="Tolak"
                                  >
                                    <X size={14} strokeWidth={2.5} />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            {pagination.totalPages > 1 && (
              <div className="p-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/50 font-sans">
                <span className="text-xs text-gray-500 font-semibold">
                  Halaman <strong className="text-gray-800">{pagination.currentPage}</strong> dari{" "}
                  <strong className="text-gray-800">{pagination.totalPages}</strong>
                  {" "}• <strong className="text-gray-800">{pagination.total}</strong> total permintaan
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={page === 1}
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    className="px-4 py-2 text-xs font-bold text-gray-600 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Sebelumnya
                  </button>
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                    .filter(
                      (p) =>
                        p === 1 || p === pagination.totalPages || Math.abs(p - page) <= 1
                    )
                    .map((pageNum, idx, arr) => {
                      const prevPage = arr[idx - 1];
                      return (
                        <React.Fragment key={pageNum}>
                          {prevPage && pageNum - prevPage > 1 && (
                            <span className="text-gray-400 text-xs px-1 select-none">...</span>
                          )}
                          <button
                            type="button"
                            onClick={() => setPage(pageNum)}
                            className={`w-8 h-8 flex items-center justify-center text-xs font-bold rounded-xl transition-all cursor-pointer ${
                              page === pageNum
                                ? "bg-[#2D7344] text-white shadow-sm"
                                : "text-gray-600 bg-white hover:bg-gray-100 border border-gray-200"
                            }`}
                          >
                            {pageNum}
                          </button>
                        </React.Fragment>
                      );
                    })}
                  <button
                    type="button"
                    disabled={page === pagination.totalPages}
                    onClick={() => setPage((prev) => Math.min(prev + 1, pagination.totalPages))}
                    className="px-4 py-2 text-xs font-bold text-gray-600 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Selanjutnya
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* MODAL DETAIL */}
        {selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <h3 className="text-lg font-bold text-gray-800">Detail Permintaan Data</h3>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-0 font-sans max-h-[75vh] overflow-y-auto custom-scrollbar">
                <DetailRow label="Nama Pemohon" value={selectedRequest.nama || "-"} bold />
                <DetailRow label="No. HP / WA" value={selectedRequest.no_hp || selectedRequest.noHp || "-"} mono />
                <DetailRow label="Email Pemohon" value={selectedRequest.email || "-"} />
                <DetailRow
                  label="Tanggal Permintaan"
                  value={
                    selectedRequest.createdAt
                      ? new Date(selectedRequest.createdAt).toLocaleString("id-ID", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "-"
                  }
                />
                <DetailRow
                  label="Tipe Ekspor"
                  value={
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100">
                      {(selectedRequest.export_type || "-").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                    </span>
                  }
                />
                <DetailRow
                  label="Tahun Data"
                  value={selectedRequest.filters?.tahun || "-"}
                  mono
                />
                <DetailRow
                  label="Tingkat Administrasi"
                  value={
                    <span className="font-bold text-gray-800 capitalize">
                      {selectedRequest.filters?.tingkatAdministrasi || selectedRequest.filters?.tingkat_administrasi || "Nasional"}
                    </span>
                  }
                />
                {getProvinsiName(selectedRequest.filters) && (
                  <DetailRow label="Provinsi" value={getProvinsiName(selectedRequest.filters)} bold />
                )}
                {getKabupatenName(selectedRequest.filters) && (
                  <DetailRow label="Kabupaten" value={getKabupatenName(selectedRequest.filters)} bold />
                )}
                {getKecamatanName(selectedRequest.filters) && (
                  <DetailRow label="Kecamatan" value={getKecamatanName(selectedRequest.filters)} bold />
                )}
                {getDesaName(selectedRequest.filters) && (
                  <DetailRow label="Desa" value={getDesaName(selectedRequest.filters)} bold />
                )}
                <DetailRow
                  label="Jenis Data"
                  value={formatJenisDataBadges(selectedRequest.filters?.jenisData)}
                />
                <DetailRow
                  label="Status"
                  value={<StatusBadge status={selectedRequest.status} />}
                />

                {/* Reject reason */}
                {selectedRequest.status === "rejected" && selectedRequest.reject_reason && (
                  <div className="mt-3 p-4 bg-red-50 border border-red-100 rounded-2xl flex gap-3">
                    <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={16} />
                    <div>
                      <h4 className="text-xs font-black text-red-700 uppercase tracking-widest mb-1">
                        Alasan Penolakan
                      </h4>
                      <p className="text-xs text-red-800 font-medium leading-relaxed">
                        {selectedRequest.reject_reason}
                      </p>
                    </div>
                  </div>
                )}

                {/* Error message for failed */}
                {selectedRequest.status === "failed" && selectedRequest.error_message && (
                  <div className="mt-3 p-4 bg-orange-50 border border-orange-100 rounded-2xl flex gap-3">
                    <AlertTriangle className="text-orange-500 shrink-0 mt-0.5" size={16} />
                    <div>
                      <h4 className="text-xs font-black text-orange-700 uppercase tracking-widest mb-1">
                        Pesan Error
                      </h4>
                      <p className="text-xs text-orange-800 font-medium leading-relaxed">
                        {selectedRequest.error_message}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end font-sans">
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="px-5 py-2.5 text-sm font-bold text-gray-600 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl transition-all cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL APPROVE CONFIRMATION */}
        {approvingReqId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="h-1 bg-[#00C47C]" />
              <div className="p-6">
                <div className="flex items-center gap-3 text-[#00C47C] mb-3">
                  <CheckCircle2 size={24} />
                  <h3 className="text-lg font-bold text-gray-800">Setujui Permintaan</h3>
                </div>
                <p className="text-xs text-gray-500 font-semibold mb-6">
                  Apakah Anda yakin ingin menyetujui permintaan data ini? Berkas data desa akan dipersiapkan untuk pemohon.
                </p>
                <div className="flex justify-end gap-3 font-sans">
                  <button
                    type="button"
                    onClick={() => setApprovingReqId(null)}
                    className="px-4 py-2.5 text-xs font-bold text-gray-600 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl transition-all cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      approveMutation.mutate(approvingReqId);
                      setApprovingReqId(null);
                    }}
                    disabled={approveMutation.isPending}
                    className="px-4 py-2.5 text-xs font-bold text-white bg-[#00C47C] hover:bg-[#00a86b] rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {approveMutation.isPending && (
                      <Loader2 size={12} className="animate-spin" />
                    )}
                    Ya, Setujui
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL REJECT */}
        {rejectingReqId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <h3 className="text-lg font-bold text-gray-800">Alasan Penolakan</h3>
                <button
                  onClick={() => {
                    setRejectingReqId(null);
                    setAlasanReject("");
                  }}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleRejectSubmit}>
                <div className="p-6 space-y-4 font-sans">
                  <div className="space-y-2">
                    <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-widest ml-1">
                      Alasan Menolak Permintaan
                    </label>
                    <textarea
                      value={alasanReject}
                      onChange={(e) => setAlasanReject(e.target.value)}
                      placeholder="Masukkan alasan penolakan secara mendetail agar pemohon mengetahuinya..."
                      rows="4"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-gray-800 placeholder-gray-400 font-semibold focus:bg-white focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all resize-none"
                      required
                    ></textarea>
                  </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 font-sans">
                  <button
                    type="button"
                    onClick={() => {
                      setRejectingReqId(null);
                      setAlasanReject("");
                    }}
                    className="px-5 py-2.5 text-sm font-bold text-gray-600 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl transition-all cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={rejectMutation.isPending}
                    className="px-5 py-2.5 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2 cursor-pointer"
                  >
                    {rejectMutation.isPending && <Loader2 size={16} className="animate-spin" />}
                    Tolak Permintaan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </DashboardLayout>
  );
}

// ── Reusable sub-components ──

function StatCard({ label, value, color }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
      <span className={`text-[10px] font-bold uppercase tracking-wider ${color}`}>{label}</span>
      <span className={`text-2xl font-extrabold mt-2 ${color}`}>{value}</span>
    </div>
  );
}

function DetailRow({ label, value, bold, mono }) {
  return (
    <div className="grid grid-cols-3 gap-2 py-2.5 border-b border-gray-50">
      <span className="text-gray-400 font-semibold uppercase tracking-wider text-[10px]">
        {label}
      </span>
      <span
        className={`col-span-2 text-gray-800 ${bold ? "font-bold" : "font-semibold"} ${
          mono ? "font-mono" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}
