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
  Download,
  Eye,
  Search,
  Loader2,
  Inbox,
  AlertCircle,
  AlertTriangle,
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
const getFilterValue = (filters, key, fallback = "-") => {
  if (!filters) return fallback;
  return filters[key] || fallback;
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

  // ── Fetch paginated requests ──
  const { data: requestRes, isLoading, isError, refetch } = useQuery({
    queryKey: ["request-excel-list", page, size, searchQuery, statusFilter],
    queryFn: () =>
      performaDesaService.getAllRequestExcel({
        page,
        size,
        search: searchQuery,
        status: statusFilter === "all" ? "" : statusFilter,
      }),
  });

  // ── Fetch all requests for stats (limit 1000) ──
  const { data: allRequestsRes } = useQuery({
    queryKey: ["request-excel-all-stats"],
    queryFn: () => performaDesaService.getAllRequestExcel({ page: 1, size: 1000 }),
  });

  // ── Extract paginated items ──
  const requests = React.useMemo(() => {
    const list = requestRes?.data?.items || requestRes?.items || [];
    if (!isAdmin) {
      const userEmail = String(user?.username || user?.email || "").toLowerCase();
      return list.filter((r) => String(r.email).toLowerCase() === userEmail);
    }
    return list;
  }, [requestRes, isAdmin, user]);

  // ── Extract pagination from response ──
  const pagination = React.useMemo(() => {
    const p = requestRes?.data?.pagination || requestRes?.pagination;
    if (p) {
      return {
        total: p.total || 0,
        totalPages: p.totalPage || p.totalPages || 1,
        currentPage: p.currentPage || 1,
        perPage: p.perPage || size,
      };
    }
    // Check direct properties for fallback
    const directData = requestRes?.data || requestRes;
    if (directData && typeof directData.total === "number") {
      return {
        total: directData.total,
        totalPages: directData.totalPages || Math.ceil(directData.total / size) || 1,
        currentPage: directData.page || page,
        perPage: directData.size || size,
      };
    }
    // Fallback
    return {
      total: requests.length,
      totalPages: Math.ceil(requests.length / size) || 1,
      currentPage: page,
      perPage: size,
    };
  }, [requestRes, requests, size, page]);

  // ── Extract all requests for stats ──
  const allRequests = React.useMemo(() => {
    return allRequestsRes?.data?.items || allRequestsRes?.items || [];
  }, [allRequestsRes]);

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
    mutationFn: (id) =>
      performaDesaService.updateRequestExcelStatus(id, {
        status: "approved",
        message: null,
      }),
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
      performaDesaService.updateRequestExcelStatus(id, {
        status: "rejected",
        message: alasan,
        reject_reason: alasan,
        rejectReason: alasan,
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

  // ── Column count for colSpan ──
  const colCount = isAdmin ? 9 : 8;

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
                    placeholder="Cari email, wilayah, tahun..."
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
                    {isAdmin && <th className="py-4 px-6">Email Pemohon</th>}
                    <th className="py-4 px-6">Tipe Ekspor</th>
                    <th className="py-4 px-6">Tahun</th>
                    <th className="py-4 px-6">Provinsi</th>
                    <th className="py-4 px-6">Kabupaten</th>
                    <th className="py-4 px-6">Kecamatan</th>
                    <th className="py-4 px-6 text-center">Status</th>
                    <th className="py-4 px-6 text-center w-36">Aksi</th>
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
                  ) : requests.length === 0 ? (
                    <tr>
                      <td colSpan={colCount} className="py-16 text-center text-gray-400">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <Inbox size={40} className="text-gray-300" />
                          <p className="text-sm font-medium">Belum ada data permintaan.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    requests.map((req, idx) => {
                      const filters = req.filters || {};
                      const prov = getFilterValue(filters, "provinsi");
                      const kab = getFilterValue(filters, "kabupaten");
                      const kec = getFilterValue(filters, "kecamatan");

                      // Format export_type for display
                      const exportType = (req.export_type || "-")
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (c) => c.toUpperCase());

                      return (
                        <tr
                          key={req.id}
                          className="border-b border-gray-50 hover:bg-[#F9FBFA] transition-colors"
                        >
                          <td className="py-4 px-6 text-center font-mono text-gray-400">
                            {(page - 1) * size + idx + 1}
                          </td>
                          {isAdmin && (
                            <td className="py-4 px-6 text-gray-900 font-bold">{req.email}</td>
                          )}
                          <td className="py-4 px-6">
                            <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100">
                              {exportType}
                            </span>
                          </td>
                          <td className="py-4 px-6 font-mono font-bold text-gray-600">
                            {filters.tahun || "-"}
                          </td>
                          <td className="py-4 px-6">{prov}</td>
                          <td className="py-4 px-6">{kab}</td>
                          <td className="py-4 px-6">{kec}</td>
                          <td className="py-4 px-6 text-center">
                            <StatusBadge status={req.status} />
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center justify-center gap-2">
                              {/* View detail */}
                              <button
                                onClick={() => setSelectedRequest(req)}
                                className="p-2 text-gray-500 hover:text-[#2D7344] hover:bg-[#EAFBF0] rounded-xl transition-all cursor-pointer"
                                title="Lihat Detail"
                              >
                                <Eye size={16} />
                              </button>

                              {/* Admin: approve / reject */}
                              {isAdmin && req.status === "pending" && (
                                <>
                                  <button
                                    onClick={() => setApprovingReqId(req.id)}
                                    className="p-2 text-white bg-[#00C47C] hover:bg-[#00a86b] rounded-xl transition-all shadow-sm flex items-center justify-center cursor-pointer"
                                    title="Setujui"
                                  >
                                    <Check size={16} strokeWidth={2.5} />
                                  </button>
                                  <button
                                    onClick={() => setRejectingReqId(req.id)}
                                    className="p-2 text-white bg-red-500 hover:bg-red-600 rounded-xl transition-all shadow-sm flex items-center justify-center cursor-pointer"
                                    title="Tolak"
                                  >
                                    <X size={16} strokeWidth={2.5} />
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
                  {" "}• <strong className="text-gray-800">{pagination.total}</strong> total data
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
                <h3 className="text-lg font-bold text-gray-800">Detail Permintaan</h3>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-0 font-sans">
                <DetailRow label="Email Pemohon" value={selectedRequest.email} bold />
                <DetailRow
                  label="Tipe Ekspor"
                  value={
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100">
                      {(selectedRequest.export_type || "-").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                    </span>
                  }
                />
                <DetailRow
                  label="Tahun"
                  value={selectedRequest.filters?.tahun || "-"}
                  mono
                />
                <DetailRow
                  label="Provinsi"
                  value={getFilterValue(selectedRequest.filters, "provinsi")}
                />
                <DetailRow
                  label="Kabupaten"
                  value={getFilterValue(selectedRequest.filters, "kabupaten")}
                />
                <DetailRow
                  label="Kecamatan"
                  value={getFilterValue(selectedRequest.filters, "kecamatan")}
                />
                <DetailRow
                  label="Fungsi Kawasan"
                  value={getFilterValue(selectedRequest.filters, "fungsiKawasan")}
                />
                <DetailRow
                  label="Index Desa Hutan"
                  value={getFilterValue(selectedRequest.filters, "indexDesaHutan")}
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
