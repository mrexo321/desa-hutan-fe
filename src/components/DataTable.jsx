import React from "react";
import { Loader2, AlertCircle, Inbox, Search } from "lucide-react";

const DataTable = ({
  columns,
  data,
  isLoading,
  isError,
  searchQuery,
  emptyMessage = "Belum ada data",
}) => {
  const colSpan = columns.length;

  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-left border-collapse whitespace-nowrap">
        <thead>
          <tr className="bg-slate-50/80 border-b border-slate-200 text-[12px] uppercase tracking-widest font-bold text-slate-500">
            {columns.map((col, index) => (
              <th key={index} className={`py-4 px-6 ${col.className || ""}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-sm font-medium text-slate-700 divide-y divide-slate-100/80">
          {/* STATE: LOADING (SKELETON) */}
          {isLoading && (
            <>
              {[1, 2, 3].map((item) => (
                <tr key={item} className="animate-pulse">
                  {columns.map((_, colIdx) => (
                    <td key={colIdx} className="py-5 px-6">
                      <div className="h-4 bg-slate-200/70 rounded-md w-full max-w-[80%]"></div>
                    </td>
                  ))}
                </tr>
              ))}
            </>
          )}

          {/* STATE: ERROR */}
          {!isLoading && isError && (
            <tr>
              <td colSpan={colSpan} className="py-16 text-center bg-red-50/30">
                <div className="flex flex-col items-center gap-3">
                  <div className="p-3 bg-red-100 text-red-600 rounded-full">
                    <AlertCircle size={28} />
                  </div>
                  <div>
                    <p className="font-bold text-red-700">Gagal memuat data</p>
                    <p className="text-red-500/80 text-sm mt-1">
                      Silakan periksa koneksi atau coba lagi nanti.
                    </p>
                  </div>
                </div>
              </td>
            </tr>
          )}

          {/* STATE: BERHASIL MENDAPATKAN DATA */}
          {!isLoading &&
            !isError &&
            data.length > 0 &&
            data.map((row, rowIndex) => (
              <tr
                key={row.id || rowIndex}
                className="hover:bg-slate-50 transition-all duration-200 group"
              >
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className="py-4 px-6">
                    {/* Jika ada custom render, gunakan itu. Jika tidak, tampilkan value text biasa */}
                    {col.render ? col.render(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))}

          {/* STATE: DATA KOSONG */}
          {!isLoading && !isError && data.length === 0 && (
            <tr>
              <td colSpan={colSpan} className="py-20">
                <div className="flex flex-col items-center justify-center text-center px-4">
                  <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mb-4 shadow-inner">
                    {searchQuery ? <Search size={32} /> : <Inbox size={32} />}
                  </div>
                  <h3 className="text-slate-800 font-bold text-lg">
                    {searchQuery ? "Data tidak ditemukan" : emptyMessage}
                  </h3>
                  <p className="text-slate-500 text-sm mt-1 max-w-xs">
                    {searchQuery
                      ? `Kami tidak menemukan hasil untuk kata kunci "${searchQuery}".`
                      : "Anda belum menambahkan data apa pun ke dalam tabel ini."}
                  </p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
