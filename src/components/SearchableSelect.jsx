import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, X, Loader2, Check } from "lucide-react";

export default function SearchableSelect({
  value,
  onChange,
  options = [],
  placeholder = "-- Pilih --",
  disabled = false,
  isLoading = false,
  searchPlaceholder = "Cari...",
  noOptionsText = "Tidak ditemukan data.",
  disabledText = "Pilihan belum tersedia",
  id,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    } else {
      setSearch("");
    }
  }, [isOpen]);

  const selectedOption = options.find((opt) => String(opt.id) === String(value));

  const filteredOptions = options.filter((opt) => {
    const label = String(opt.name || opt.nama || opt.label || "").toLowerCase();
    return label.includes(search.toLowerCase());
  });

  const handleSelect = (opt) => {
    onChange(opt.id);
    setIsOpen(false);
    setSearch("");
  };

  return (
    <div className="relative w-full font-sans" ref={containerRef}>
      {/* Trigger Button */}
      <button
        id={id}
        type="button"
        disabled={disabled || isLoading}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm font-semibold flex items-center justify-between transition-all cursor-pointer text-left ${
          disabled || isLoading
            ? "bg-slate-100 opacity-75 cursor-not-allowed border-slate-200 text-slate-400"
            : isOpen
            ? "bg-white border-emerald-500 ring-4 ring-emerald-500/10 text-slate-800"
            : "border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100/50"
        }`}
      >
        <span className={`truncate ${!selectedOption ? "text-slate-400 font-normal" : "text-slate-800 font-bold"}`}>
          {isLoading
            ? "Memuat data..."
            : disabled
            ? disabledText
            : selectedOption
            ? selectedOption.name || selectedOption.nama || selectedOption.label
            : placeholder}
        </span>
        <div className="flex items-center gap-1 shrink-0 ml-2 text-slate-400">
          {value && !disabled && !isLoading && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
              }}
              className="p-1 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-colors"
              title="Hapus Pilihan"
            >
              <X size={14} />
            </span>
          )}
          {isLoading ? (
            <Loader2 size={16} className="animate-spin text-emerald-600" />
          ) : (
            <ChevronDown
              size={16}
              className={`transition-transform duration-200 ${isOpen ? "rotate-180 text-emerald-600" : ""}`}
            />
          )}
        </div>
      </button>

      {/* Popover Dropdown */}
      {isOpen && !disabled && !isLoading && (
        <div className="absolute top-[105%] left-0 right-0 z-50 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Search Box */}
          <div className="p-2.5 border-b border-slate-100 bg-slate-50/80 sticky top-0 z-10">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto custom-scrollbar p-1">
            {filteredOptions.length === 0 ? (
              <div className="py-4 px-3 text-center text-xs text-slate-400 font-medium">
                {noOptionsText}
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = String(opt.id) === String(value);
                const label = opt.name || opt.nama || opt.label;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelect(opt)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-emerald-50 text-emerald-800 font-bold"
                        : "text-slate-700 hover:bg-slate-100/80 hover:text-slate-900"
                    }`}
                  >
                    <span className="truncate">{label}</span>
                    {isSelected && <Check size={14} className="text-emerald-600 shrink-0 ml-2" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
