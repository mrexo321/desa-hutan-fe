import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({
  currentPage,
  totalPage,
  perPage,
  total,
  onPageChange,
  onSizeChange,
  sizeOptions = [10, 20, 50, 100], // Default opsi ukuran
}) => {
  // Cegah render jika tidak ada data
  if (!total || total === 0) return null;

  return (
    <div className="p-4 md:px-6 border-t border-gray-100 bg-white flex flex-col md:flex-row items-center justify-between gap-4 rounded-b-2xl">
      {/* Select Baris Per Halaman */}
      <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
        <span>Tampilkan</span>
        <select
          value={perPage}
          onChange={(e) => {
            onSizeChange(Number(e.target.value));
            onPageChange(1); // Reset ke halaman 1 setiap ubah ukuran
          }}
          className="bg-gray-50 border border-gray-200 text-gray-700 py-1.5 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D7344] cursor-pointer transition-all"
        >
          {sizeOptions.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
        <span>data</span>
      </div>

      {/* Info dan Navigasi Halaman */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500 font-medium hidden md:block">
          {Math.min((currentPage - 1) * perPage + 1, total)} -{" "}
          {Math.min(currentPage * perPage, total)} dari {total} data
        </span>

        <div className="flex items-center gap-1.5 bg-gray-50 p-1 rounded-xl border border-gray-100">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-white hover:shadow-sm disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
          >
            <ChevronLeft size={18} />
          </button>

          <span className="text-sm font-bold text-gray-700 px-3">
            {currentPage}{" "}
            <span className="text-gray-400 font-medium mx-1">/</span>{" "}
            {totalPage}
          </span>

          <button
            onClick={() => onPageChange(Math.min(totalPage, currentPage + 1))}
            disabled={currentPage === totalPage}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-white hover:shadow-sm disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
