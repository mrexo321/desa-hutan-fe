import React, { useState, useEffect } from "react";
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
  AlertCircle
} from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import { performaDesaService } from "../../services/master/performaDesaService";

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
  const [alasanReject, setAlasanReject] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Pagination & Filter State
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch paginated requests
  const { data: requestRes, isLoading, isError, refetch } = useQuery({
    queryKey: ["request-excel-list", page, size, searchQuery, statusFilter],
    queryFn: () => performaDesaService.getAllRequestExcel({
      page,
      size,
      search: searchQuery,
      status: statusFilter === "all" ? "" : statusFilter
    }),
  });

  // Fetch all requests for stats calculation (limit 1000)
  const { data: allRequestsRes } = useQuery({
    queryKey: ["request-excel-all-stats"],
    queryFn: () => performaDesaService.getAllRequestExcel({ page: 1, size: 1000 }),
  });

  // Extract paginated items
  const requests = React.useMemo(() => {
    let list = [];
    if (requestRes) {
      if (requestRes.data && Array.isArray(requestRes.data.items)) {
        list = requestRes.data.items;
      } else if (Array.isArray(requestRes.items)) {
        list = requestRes.items;
      } else if (Array.isArray(requestRes.data)) {
        list = requestRes.data;
      } else if (Array.isArray(requestRes)) {
        list = requestRes;
      }
    }
    if (!isAdmin) {
      return list.filter((r) => String(r.email).toLowerCase() === String(user?.username || user?.email).toLowerCase());
    }
    return list;
  }, [requestRes, isAdmin, user]);

  // Extract all requests for stats
  const allRequests = React.useMemo(() => {
    if (!allRequestsRes) return [];
    if (allRequestsRes.data && Array.isArray(allRequestsRes.data.items)) {
      return allRequestsRes.data.items;
    }
    if (Array.isArray(allRequestsRes.items)) {
      return allRequestsRes.items;
    }
    if (Array.isArray(allRequestsRes.data)) {
      return allRequestsRes.data;
    }
    if (Array.isArray(allRequestsRes)) {
      return allRequestsRes;
    }
    return [];
  }, [allRequestsRes]);

  // Calculate robust pagination info
  const pagination = React.useMemo(() => {
    let total = 0;
    let totalPages = 1;
    
    if (requestRes) {
      if (requestRes.data && typeof requestRes.data.total === "number") {
        total = requestRes.data.total;
      } else if (typeof requestRes.total === "number") {
        total = requestRes.total;
      }
      
      if (requestRes.data && typeof requestRes.data.totalPages === "number") {
        totalPages = requestRes.data.totalPages;
      } else if (typeof requestRes.totalPages === "number") {
        totalPages = requestRes.totalPages;
      } else if (typeof requestRes.total_pages === "number") {
        totalPages = requestRes.total_pages;
      } else if (total > 0) {
        totalPages = Math.ceil(total / size);
      }
    }
    
    if (total === 0 && requests.length > 0) {
      total = requests.length;
      totalPages = Math.ceil(total / size) || 1;
    }
    
    return { total, totalPages };
  }, [requestRes, requests, size]);

  // Statistics calculation
  const stats = React.useMemo(() => {
    const list = isAdmin
      ? allRequests
      : allRequests.filter((r) => String(r.email).toLowerCase() === String(user?.username || user?.email).toLowerCase());

    return {
      total: list.length,
      pending: list.filter((r) => r.status === "pending").length,
      approved: list.filter((r) => r.status === "approved").length,
      rejected: list.filter((r) => r.status === "rejected").length,
    };
  }, [allRequests, isAdmin, user]);

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: (id) => performaDesaService.updateRequestExcelStatus(id, { status: "approved", message: null }),
    onSuccess: () => {
      toast.success("Permintaan data berhasil disetujui!");
      queryClient.invalidateQueries(["request-excel-list"]);
      queryClient.invalidateQueries(["request-excel-all-stats"]);
      refetch();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Gagal menyetujui permintaan.");
    },
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: ({ id, alasan }) => performaDesaService.updateRequestExcelStatus(id, { status: "rejected", message: alasan }),
    onSuccess: () => {
      toast.success("Permintaan data berhasil ditolak.");
      setRejectingReqId(null);
      setAlasanReject("");
      queryClient.invalidateQueries(["request-excel-list"]);
      queryClient.invalidateQueries(["request-excel-all-stats"]);
      refetch();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Gagal menolak permintaan.");
    },
  });

  const handleApprove = (id) => {
    if (window.confirm("Apakah Anda yakin ingin menyetujui permintaan data ini?")) {
      approveMutation.mutate(id);
    }
  };

  const handleRejectSubmit = (e) => {
    e.preventDefault();
    if (!alasanReject.trim()) {
      toast.warning("Alasan penolakan wajib diisi!");
      return;
    }
    rejectMutation.mutate({ id: rejectingReqId, alasan: alasanReject.trim() });
  };

  // CSV Generator for approved request
  const handleDownloadExcel = (req) => {
    const prov = req.provinsi || req.provinsiNama || req.provinsi_nama || "Nasional";
    const kab = req.kabupaten || req.kabupatenNama || req.kabupaten_nama || "-";
    const kec = req.kecamatan || req.kecamatanNama || req.kecamatan_nama || "-";
    const tahun = req.tahun || "-";

    const headers = ["No", "Tahun", "Provinsi", "Kabupaten", "Kecamatan", "Nama Desa", "Klasifikasi", "Nilai Indikator"];

    // Generate simulated village records
    const mockRows = [
      [1, tahun, prov, kab, kec, `Desa ${kec !== "-" ? kec : ""} Jaya`, "Mandiri", "88.40"],
      [2, tahun, prov, kab, kec, `Desa ${kec !== "-" ? kec : ""} Mulya`, "Maju", "79.10"],
      [3, tahun, prov, kab, kec, `Desa ${kec !== "-" ? kec : ""} Bakti`, "Berkembang", "68.50"],
      [4, tahun, prov, kab, kec, `Desa ${kec !== "-" ? kec : ""} Sari`, "Berkembang", "61.30"],
      [5, tahun, prov, kab, kec, `Desa ${kec !== "-" ? kec : ""} Wana`, "Tertinggal", "42.80"],
    ];

    const csvContent = [
      headers.join(","),
      ...mockRows.map((row) => row.map((val) => `"${val}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Data_Desa_${prov}_${kab}_${kec}_${tahun}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("File Excel (CSV) berhasil diunduh!");
  };

  return (
    <DashboardLayout activeMenu="Permintaan Data">
      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-[#FAFBFC]">
        <div className="flex-1 overflow-y-auto px-6 md:px-10 py-8 custom-scrollbar">
          
          {/* HEADER HALAMAN */}
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

          {/* STATISTIK CARDS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 font-sans">
            {/* Total */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Permintaan</span>
              <span className="text-2xl font-extrabold text-gray-900 mt-2">{stats.total}</span>
            </div>
            {/* Pending */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
              <span className="text-[10px] font-bold text-yellow-600 uppercase tracking-wider">Menunggu Persetujuan</span>
              <span className="text-2xl font-extrabold text-yellow-600 mt-2">{stats.pending}</span>
            </div>
            {/* Approved */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
              <span className="text-[10px] font-bold text-[#2D7344] uppercase tracking-wider">Disetujui</span>
              <span className="text-2xl font-extrabold text-[#2D7344] mt-2">{stats.approved}</span>
            </div>
            {/* Rejected */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
              <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">Ditolak</span>
              <span className="text-2xl font-extrabold text-red-500 mt-2">{stats.rejected}</span>
            </div>
          </div>

          {/* CARD UTAMA */}
          <div className="bg-white rounded-3xl shadow-[0_4px_25px_rgba(0,0,0,0.02)] border border-gray-100 flex flex-col overflow-hidden">
            {/* Toolbar */}
            <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4 font-sans">
              <div className="flex flex-col gap-2">
                <h2 className="text-lg font-bold text-gray-800">Daftar Permintaan Ekspor</h2>
                {/* Status Filter Tabs */}
                <div className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-xl w-fit">
                  {[
                    { value: "all", label: "Semua" },
                    { value: "pending", label: "Pending" },
                    { value: "approved", label: "Disetujui" },
                    { value: "rejected", label: "Ditolak" },
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
              
              <div className="relative w-full md:w-80 group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#2D7344] transition-colors" size={16} />
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
            </div>

            {/* Tabel Data */}
            <div className="overflow-x-auto w-full font-sans">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-[10px] uppercase tracking-wider font-bold text-gray-500">
                    <th className="py-4 px-6 w-12 text-center">No</th>
                    {isAdmin && <th className="py-4 px-6">Email Pemohon</th>}
                    <th className="py-4 px-6">Tahun</th>
                    <th className="py-4 px-6">Provinsi</th>
                    <th className="py-4 px-6">Kabupaten</th>
                    <th className="py-4 px-6">Kecamatan</th>
                    <th className="py-4 px-6">Tanggal Permintaan</th>
                    <th className="py-4 px-6 text-center">Status</th>
                    <th className="py-4 px-6 text-center w-36">Aksi</th>
                  </tr>
                </thead>
                <tbody className="text-xs font-semibold text-gray-700">
                  {isLoading ? (
                    <tr>
                      <td colSpan={isAdmin ? 9 : 8} className="py-12 text-center text-gray-400">
                        <div className="flex justify-center items-center gap-2 text-[#2D7344]">
                          <Loader2 className="animate-spin" size={18} />
                          <span>Memuat daftar permintaan...</span>
                        </div>
                      </td>
                    </tr>
                  ) : isError ? (
                    <tr>
                      <td colSpan={isAdmin ? 9 : 8} className="py-12 text-center text-red-500">
                        Gagal memuat data permintaan. Silakan hubungi admin.
                      </td>
                    </tr>
                  ) : requests.length === 0 ? (
                    <tr>
                      <td colSpan={isAdmin ? 9 : 8} className="py-16 text-center text-gray-400">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <Inbox size={40} className="text-gray-300" />
                          <p className="text-sm font-medium">Belum ada data permintaan.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    requests.map((req, idx) => {
                      // Robust extraction of properties
                      const prov = req.provinsi || req.provinsiNama || req.provinsi_nama || "-";
                      const kab = req.kabupaten || req.kabupatenNama || req.kabupaten_nama || "-";
                      const kec = req.kecamatan || req.kecamatanNama || req.kecamatan_nama || "-";
                      const dateField = req.createdAt || req.created_at;
                      const dateStr = dateField
                        ? new Intl.DateTimeFormat("id-ID", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          }).format(new Date(dateField))
                        : "-";

                      return (
                        <tr key={req.id} className="border-b border-gray-50 hover:bg-[#F9FBFA] transition-colors">
                          <td className="py-4 px-6 text-center font-mono text-gray-400">{(page - 1) * size + idx + 1}</td>
                          {isAdmin && <td className="py-4 px-6 text-gray-900 font-bold">{req.email}</td>}
                          <td className="py-4 px-6 font-mono font-bold text-gray-600">{req.tahun}</td>
                          <td className="py-4 px-6">{prov}</td>
                          <td className="py-4 px-6">{kab}</td>
                          <td className="py-4 px-6">{kec}</td>
                          <td className="py-4 px-6 text-gray-500">{dateStr}</td>
                          <td className="py-4 px-6 text-center">
                            {req.status === "pending" && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-yellow-50 text-yellow-600 border border-yellow-100">
                                <Clock size={12} />
                                Pending
                              </span>
                            )}
                            {req.status === "approved" && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-green-50 text-[#2D7344] border border-green-100 animate-pulse-slow">
                                <CheckCircle2 size={12} />
                                Disetujui
                              </span>
                            )}
                            {req.status === "rejected" && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-50 text-red-600 border border-red-100">
                                <XCircle size={12} />
                                Ditolak
                              </span>
                            )}
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

                              {/* Download Excel if approved */}
                              {req.status === "approved" && (
                                <button
                                  onClick={() => handleDownloadExcel(req)}
                                  className="p-2 text-white bg-[#2D7344] hover:bg-[#1E5230] rounded-xl transition-all shadow-sm flex items-center justify-center cursor-pointer"
                                  title="Unduh Excel"
                                >
                                  <Download size={16} />
                                </button>
                              )}

                              {/* Admin action: approve / reject */}
                              {isAdmin && req.status === "pending" && (
                                <>
                                  <button
                                    onClick={() => handleApprove(req.id)}
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

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="p-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/50 font-sans">
                <span className="text-xs text-gray-500 font-semibold">
                  Menampilkan halaman <strong className="text-gray-800">{page}</strong> dari <strong className="text-gray-800">{pagination.totalPages}</strong> ({pagination.total} total data)
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
                    .filter((p) => p === 1 || p === pagination.totalPages || Math.abs(p - page) <= 1)
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

        {/* MODAL DETAIL PERMINTAAN */}
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

              <div className="p-6 space-y-4 font-sans">
                <div className="grid grid-cols-3 gap-2 py-2 border-b border-gray-50">
                  <span className="text-gray-400 font-semibold uppercase tracking-wider text-[10px]">Email Pemohon</span>
                  <span className="col-span-2 text-gray-800 font-bold">{selectedRequest.email}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 py-2 border-b border-gray-50">
                  <span className="text-gray-400 font-semibold uppercase tracking-wider text-[10px]">Tahun</span>
                  <span className="col-span-2 text-gray-800 font-semibold font-mono">{selectedRequest.tahun}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 py-2 border-b border-gray-50">
                  <span className="text-gray-400 font-semibold uppercase tracking-wider text-[10px]">Provinsi</span>
                  <span className="col-span-2 text-gray-800 font-semibold">{selectedRequest.provinsi || selectedRequest.provinsiNama || selectedRequest.provinsi_nama || "-"}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 py-2 border-b border-gray-50">
                  <span className="text-gray-400 font-semibold uppercase tracking-wider text-[10px]">Kabupaten</span>
                  <span className="col-span-2 text-gray-800 font-semibold">{selectedRequest.kabupaten || selectedRequest.kabupatenNama || selectedRequest.kabupaten_nama || "-"}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 py-2 border-b border-gray-50">
                  <span className="text-gray-400 font-semibold uppercase tracking-wider text-[10px]">Kecamatan</span>
                  <span className="col-span-2 text-gray-800 font-semibold">{selectedRequest.kecamatan || selectedRequest.kecamatanNama || selectedRequest.kecamatan_nama || "-"}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 py-2 border-b border-gray-50">
                  <span className="text-gray-400 font-semibold uppercase tracking-wider text-[10px]">Status</span>
                  <span className="col-span-2 font-bold">
                    {selectedRequest.status === "pending" && <span className="text-yellow-600">Pending</span>}
                    {selectedRequest.status === "approved" && <span className="text-[#2D7344]">Disetujui</span>}
                    {selectedRequest.status === "rejected" && <span className="text-red-500">Ditolak</span>}
                  </span>
                </div>
                {selectedRequest.status === "rejected" && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex gap-3">
                    <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={16} />
                    <div>
                      <h4 className="text-xs font-black text-red-700 uppercase tracking-widest mb-1">Alasan Penolakan</h4>
                      <p className="text-xs text-red-800 font-medium leading-relaxed font-sans">
                        {selectedRequest.message || selectedRequest.alasanReject || selectedRequest.alasan_reject || "Tidak ada alasan spesifik."}
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

        {/* MODAL INPUT REJECT REASON */}
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
