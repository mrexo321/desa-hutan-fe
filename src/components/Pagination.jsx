import React, { useMemo } from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

// Menggunakan React.memo agar Pagination tidak ikut re-render jika tidak ada perubahan props
// Sangat berguna untuk menghemat performa jika berada di dalam komponen tabel yang besar
const Pagination = React.memo(({
  currentPage,
  totalPage,
  perPage,
  total,
  onPageChange,
  onSizeChange,
  sizeOptions = [10, 20, 50, 100],
}) => {
  // Optimasi perhitungan halaman yang ditampilkan (untuk mencegah lag saat total halaman ribuan)
  const visiblePages = useMemo(() => {
    const pages = [];
    
    // Jika total halaman sedikit (<= 5), tampilkan semua
    if (totalPage <= 5) {
      for (let i = 1; i <= totalPage; i++) pages.push(i);
      return pages;
    }

    // Jika di awal
    if (currentPage <= 3) {
      pages.push(1, 2, 3, 4, '...', totalPage);
      return pages;
    }

    // Jika di akhir
    if (currentPage >= totalPage - 2) {
      pages.push(1, '...', totalPage - 3, totalPage - 2, totalPage - 1, totalPage);
      return pages;
    }

    // Jika di tengah
    pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPage);
    return pages;
  }, [currentPage, totalPage]);

  // Handler optimasi untuk select size
  const handleSizeChange = (e) => {
    const newSize = Number(e.target.value);
    if (newSize !== perPage) {
      onSizeChange(newSize);
      onPageChange(1); // Selalu kembalikan ke halaman 1
    }
  };

  // Cegah render jika tidak ada data (dilakukan setelah semua hooks)
  if (!total || total === 0) return null;

  return (
    <div className="p-4 md:px-6 border-t border-gray-100 bg-white flex flex-col md:flex-row items-center justify-between gap-4 rounded-b-2xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
      {/* Select Baris Per Halaman */}
      <div className="flex items-center gap-3 text-sm text-gray-500 font-medium w-full md:w-auto justify-between md:justify-start">
        <span className="hidden sm:inline">Tampilkan</span>
        <select
          value={perPage}
          onChange={handleSizeChange}
          className="bg-gray-50 border border-gray-200 text-gray-700 py-2 px-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D7344]/50 focus:border-[#2D7344] cursor-pointer transition-all hover:bg-gray-100 appearance-none pr-8 relative"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 0.5rem center",
            backgroundSize: "1rem"
          }}
        >
          {sizeOptions.map((size) => (
            <option key={size} value={size}>
              {size} Baris
            </option>
          ))}
        </select>
        <span className="text-gray-400">
          dari total <strong className="text-gray-700">{total}</strong> data
        </span>
      </div>

      {/* Navigasi Halaman */}
      <div className="flex items-center gap-2 w-full md:w-auto justify-center md:justify-end">
        {/* Tombol Prev */}
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="flex items-center justify-center w-9 h-9 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-[#2D7344] hover:border-[#2D7344]/30 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:border-gray-200 disabled:hover:text-gray-500 transition-all cursor-pointer"
          aria-label="Halaman Sebelumnya"
        >
          <ChevronLeft size={18} strokeWidth={2.5} />
        </button>

        {/* Angka Halaman (Desktop) */}
        <div className="hidden sm:flex items-center gap-1.5 bg-gray-50 p-1 rounded-xl border border-gray-100">
          {visiblePages.map((page, index) => {
            if (page === '...') {
              return (
                <div key={`ellipsis-${index}`} className="flex items-center justify-center w-8 h-8 text-gray-400">
                  <MoreHorizontal size={16} />
                </div>
              );
            }

            const isActive = page === currentPage;
            return (
              <button
                key={`page-${page}`}
                onClick={() => onPageChange(page)}
                className={`w-8 h-8 rounded-lg text-sm font-bold transition-all flex items-center justify-center ${
                  isActive
                    ? "bg-[#2D7344] text-white shadow-md"
                    : "text-gray-600 hover:bg-white hover:shadow-sm"
                }`}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* Info Singkat Halaman (Mobile) */}
        <div className="flex sm:hidden items-center justify-center px-4 py-1.5 bg-gray-50 rounded-xl border border-gray-100">
          <span className="text-sm font-bold text-[#2D7344]">{currentPage}</span>
          <span className="text-sm text-gray-400 mx-1.5">/</span>
          <span className="text-sm font-bold text-gray-600">{totalPage}</span>
        </div>

        {/* Tombol Next */}
        <button
          onClick={() => onPageChange(Math.min(totalPage, currentPage + 1))}
          disabled={currentPage === totalPage}
          className="flex items-center justify-center w-9 h-9 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-[#2D7344] hover:border-[#2D7344]/30 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:border-gray-200 disabled:hover:text-gray-500 transition-all cursor-pointer"
          aria-label="Halaman Selanjutnya"
        >
          <ChevronRight size={18} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
});

// Memberikan nama display untuk debugging (karena menggunakan React.memo)
Pagination.displayName = "Pagination";

export default Pagination;
