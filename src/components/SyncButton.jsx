import { useState, useEffect, useRef } from "react";
import masterInstance from "../api/masterInstance";

export default function SyncButton({ apiBase = "/analisis-spasial" }) {
  const [state, setState] = useState("idle"); // idle | pending | running | done | failed
  const [job, setJob]     = useState(null);   // { jobId, progress, total, upserted, error }
  const pollRef           = useRef(null);

  // Bersihkan polling saat unmount
  useEffect(() => () => clearInterval(pollRef.current), []);

  const stopPolling = () => {
    clearInterval(pollRef.current);
    pollRef.current = null;
  };

  const startPolling = (jobId) => {
    pollRef.current = setInterval(async () => {
      try {
        const res  = await masterInstance.get(`${apiBase}/sync/${jobId}`);
        const data = res.data?.data || res.data;

        setJob(prev => ({ ...prev, ...data }));

        if (data.status === "done") {
          setState("done");
          stopPolling();
        } else if (data.status === "failed") {
          setState("failed");
          stopPolling();
        } else {
          setState(data.status); // pending | running
        }
      } catch (err) {
        // network error — biarkan polling lanjut, tidak langsung gagal
      }
    }, 3000);
  };

  const handleSync = async () => {
    if (state === "running" || state === "pending") return;

    setState("pending");
    setJob(null);

    try {
      const res  = await masterInstance.post(`${apiBase}/sync`);
      const data = res.data?.data || res.data;

      setJob({ jobId: data.jobId });
      startPolling(data.jobId);
    } catch (err) {
      if (err.response?.status === 409) {
        const data = err.response.data;
        // Job sudah running — langsung poll job yang ada
        setJob({ jobId: data.jobId });
        setState("running");
        startPolling(data.jobId);
        return;
      }

      setState("failed");
      setJob({ error: err.response?.data?.message || err.message || "Gagal memulai sync" });
    }
  };

  const isLoading = state === "pending" || state === "running";
  const pct = job?.total > 0
    ? Math.round((job.progress / job.total) * 100)
    : null;

  return (
    <div className="flex flex-col gap-2 items-end">

      {/* Tombol utama */}
      <button
        type="button"
        onClick={handleSync}
        disabled={isLoading}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold
          transition-colors border
          ${isLoading
            ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
            : state === "done"
            ? "bg-green-50 text-[#2D7344] border-[#2D7344] hover:bg-[#2D7344] hover:text-white"
            : state === "failed"
            ? "bg-red-50 text-red-600 border-red-300 hover:bg-red-100"
            : "bg-[#2D7344] text-white border-[#2D7344] hover:bg-[#1d4d2b]"
          }
        `}
      >
        {/* Spinner saat loading */}
        {isLoading && (
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10"
              stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
          </svg>
        )}

        {/* Icon sync saat idle/done/failed */}
        {!isLoading && (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
          </svg>
        )}

        {isLoading ? "Sinkronisasi berjalan..." : "Sync Analisis Spasial"}
      </button>

      {/* Progress bar — hanya tampil saat running */}
      {state === "running" && (
        <div className="w-full min-w-[200px] mt-1">
          <div className="flex justify-between text-[10px] text-gray-500 mb-1">
            <span>
              {pct !== null ? `${pct}%` : "Menghitung..."}
            </span>
            {job?.upserted > 0 && (
              <span>{job.upserted.toLocaleString("id-ID")} baris</span>
            )}
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#2D7344] rounded-full transition-all duration-500"
              style={{ width: pct !== null ? `${pct}%` : "100%" }}
              // Kalau total belum diketahui, tampilkan indeterminate
              {...(pct === null && {
                style: { width: "40%", animation: "pulse 1.5s ease-in-out infinite" }
              })}
            />
          </div>
        </div>
      )}

      {/* Pesan status */}
      {state === "done" && (
        <p className="text-[10px] text-[#2D7344] font-medium mt-1">
          Selesai — {job?.upserted?.toLocaleString("id-ID") ?? 0} data diperbarui.
        </p>
      )}
      {state === "failed" && (
        <p className="text-[10px] text-red-500 mt-1 max-w-[200px] text-right leading-tight">
          Gagal: {job?.error ?? "Kesalahan internal."}
        </p>
      )}

    </div>
  );
}
