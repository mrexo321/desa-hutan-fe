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
import { requestDataService } from "../../services/master/requestDataService";

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

  // Fetch requests
  const { data: requests = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["request-data-list"],
    queryFn: requestDataService.getAllRequests,
  });

  // Filter requests based on user type and search
  const filteredRequests = React.useMemo(() => {
    // 1. Filter by ownership
    let list = isAdmin
      ? requests
      : requests.filter((r) => String(r.email).toLowerCase() === String(user?.username).toLowerCase());

    // 2. Filter by search query (email, wilayah)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (r) =>
          String(r.email).toLowerCase().includes(q) ||
          String(r.provinsiNama).toLowerCase().includes(q) ||
          String(r.kabupatenNama).toLowerCase().includes(q) ||
          String(r.kecamatanNama).toLowerCase().includes(q) ||
          String(r.tahun).toLowerCase().includes(q)
      );
    }
    return list;
  }, [requests, isAdmin, user, searchQuery]);

  // Statistics
  const stats = React.useMemo(() => {
    const list = isAdmin
      ? requests
      : requests.filter((r) => String(r.email).toLowerCase() === String(user?.username).toLowerCase());

    return {
      total: list.length,
      pending: list.filter((r) => r.status === "pending").length,
      approved: list.filter((r) => r.status === "approved").length,
      rejected: list.filter((r) => r.status === "rejected").length,
    };
  }, [requests, isAdmin, user]);

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: (id) => requestDataService.approveRequest(id),
    onSuccess: () => {
      toast.success("Permintaan data berhasil disetujui!");
      queryClient.invalidateQueries(["request-data-list"]);
      refetch();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Gagal menyetujui permintaan.");
    },
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: ({ id, alasan }) => requestDataService.rejectRequest(id, { alasan }),
    onSuccess: () => {
      toast.success("Permintaan data berhasil ditolak.");
      setRejectingReqId(null);
      setAlasanReject("");
      queryClient.invalidateQueries(["request-data-list"]);
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
    const headers = ["No", "Tahun", "Provinsi", "Kabupaten", "Kecamatan", "Nama Desa", "Klasifikasi", "Nilai Indikator"];

    // Generate simulated village records
    const mockRows = [
      [1, req.tahun, req.provinsiNama, req.kabupatenNama, req.kecamatanNama, `Desa ${req.kecamatanNama} Jaya`, "Mandiri", "88.40"],
      [2, req.tahun, req.provinsiNama, req.kabupatenNama, req.kecamatanNama, `Desa ${req.kecamatanNama} Mulya`, "Maju", "79.10"],
      [3, req.tahun, req.provinsiNama, req.kabupatenNama, req.kecamatanNama, `Desa ${req.kecamatanNama} Bakti`, "Berkembang", "68.50"],
      [4, req.tahun, req.provinsiNama, req.kabupatenNama, req.kecamatanNama, `Desa ${req.kecamatanNama} Sari`, "Berkembang", "61.30"],
      [5, req.tahun, req.provinsiNama, req.kabupatenNama, req.kecamatanNama, `Desa ${req.kecamatanNama} Wana`, "Tertinggal", "42.80"],
    ];

    const csvContent = [
      headers.join(","),
      ...mockRows.map((row) => row.map((val) => `"${val}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Data_Desa_${req.provinsiNama}_${req.kabupatenNama}_${req.kecamatanNama}_${req.tahun}.csv`);
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
            <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-lg font-bold text-gray-800">Daftar Permintaan Ekspor</h2>
              
              <div className="relative w-full md:w-80 group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#2D7344] transition-colors" size={16} />
                <input
                  type="text"
                  placeholder="Cari email, wilayah, tahun..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-green-500/10 focus:border-[#2D7344] transition-all font-semibold"
                />
              </div>
            </div>

            {/* Tabel Data */}
            <div className="overflow-x-auto w-full">
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
                  ) : filteredRequests.length === 0 ? (
                    <tr>
                      <td colSpan={isAdmin ? 9 : 8} className="py-16 text-center text-gray-400">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <Inbox size={40} className="text-gray-300" />
                          <p className="text-sm font-medium">Belum ada data permintaan.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredRequests.map((req, idx) => {
                      // Format date
                      const dateStr = req.createdAt
                        ? new Intl.DateTimeFormat("id-ID", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          }).format(new Date(req.createdAt))
                        : "-";

                      return (
                        <tr key={req.id} className="border-b border-gray-50 hover:bg-[#F9FBFA] transition-colors">
                          <td className="py-4 px-6 text-center font-mono text-gray-400">{idx + 1}</td>
                          {isAdmin && <td className="py-4 px-6 text-gray-900 font-bold">{req.email}</td>}
                          <td className="py-4 px-6 font-mono font-bold text-gray-600">{req.tahun}</td>
                          <td className="py-4 px-6">{req.provinsiNama}</td>
                          <td className="py-4 px-6">{req.kabupatenNama}</td>
                          <td className="py-4 px-6">{req.kecamatanNama}</td>
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
                                className="p-2 text-gray-500 hover:text-[#2D7344] hover:bg-[#EAFBF0] rounded-xl transition-all"
                                title="Lihat Detail"
                              >
                                <Eye size={16} />
                              </button>

                              {/* Download Excel if approved */}
                              {req.status === "approved" && (
                                <button
                                  onClick={() => handleDownloadExcel(req)}
                                  className="p-2 text-white bg-[#2D7344] hover:bg-[#1E5230] rounded-xl transition-all shadow-sm flex items-center justify-center"
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
                                    className="p-2 text-white bg-[#00C47C] hover:bg-[#00a86b] rounded-xl transition-all shadow-sm flex items-center justify-center"
                                    title="Setujui"
                                  >
                                    <Check size={16} strokeWidth={2.5} />
                                  </button>
                                  <button
                                    onClick={() => setRejectingReqId(req.id)}
                                    className="p-2 text-white bg-red-500 hover:bg-red-600 rounded-xl transition-all shadow-sm flex items-center justify-center"
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
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-4">
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
                  <span className="col-span-2 text-gray-800 font-semibold">{selectedRequest.provinsiNama}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 py-2 border-b border-gray-50">
                  <span className="text-gray-400 font-semibold uppercase tracking-wider text-[10px]">Kabupaten</span>
                  <span className="col-span-2 text-gray-800 font-semibold">{selectedRequest.kabupatenNama}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 py-2 border-b border-gray-50">
                  <span className="text-gray-400 font-semibold uppercase tracking-wider text-[10px]">Kecamatan</span>
                  <span className="col-span-2 text-gray-800 font-semibold">{selectedRequest.kecamatanNama}</span>
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
                      <p className="text-xs text-red-800 font-medium leading-relaxed">
                        {selectedRequest.alasanReject || "Tidak ada alasan spesifik."}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="px-5 py-2.5 text-sm font-bold text-gray-600 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl transition-all"
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
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleRejectSubmit}>
                <div className="p-6 space-y-4">
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

                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setRejectingReqId(null);
                      setAlasanReject("");
                    }}
                    className="px-5 py-2.5 text-sm font-bold text-gray-600 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl transition-all"
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
