import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { roleService } from "../../services/auth/roleService";
import { ChevronLeft, Plus, Trash2, Save, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const CreateRole = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [roleInputs, setRoleInputs] = useState([{ name: "" }]);

  // =========================================================
  // MUTASI (SINGLE & BULK CREATE)
  // =========================================================
  const createMutation = useMutation({
    mutationFn: (payload) => {
      // Cek apakah data satu atau banyak
      if (payload.length === 1) {
        return roleService.createRole({ name: payload[0].name });
      } else {
        // PERBAIKAN: Kirim payload langsung sebagai array, bukan di dalam object { roles: payload }
        return roleService.createBulkRoles(payload);
      }
    },
    onSuccess: () => {
      toast.success("Role berhasil ditambahkan!");
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      navigate("/dashboard/manajemen-role");
    },
    onError: (err) => {
      console.error(err);

      // PERBAIKAN: Menangkap pesan error spesifik dari array errors backend (jika ada)
      const data = err?.response?.data;
      let errorMsg = data?.message || "Gagal menyimpan role.";

      if (data?.errors && data.errors.length > 0) {
        errorMsg = `${errorMsg}: ${data.errors[0].message}`;
      }

      toast.error(errorMsg);
    },
  });

  // =========================================================
  // HANDLERS FORM DINAMIS
  // =========================================================
  const handleAddInput = () => {
    setRoleInputs([...roleInputs, { name: "" }]);
  };

  const handleRemoveInput = (index) => {
    const updated = roleInputs.filter((_, i) => i !== index);
    setRoleInputs(updated);
  };

  const handleChange = (index, value) => {
    const updated = [...roleInputs];
    updated[index].name = value;
    setRoleInputs(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validasi kosong
    const validInputs = roleInputs.filter((r) => r.name.trim() !== "");
    if (validInputs.length === 0) {
      return toast.error("Minimal satu nama role harus diisi!");
    }
    createMutation.mutate(validInputs);
  };

  return (
    <DashboardLayout activeMenu="Manajemen Role">
      <main className="flex-1 flex flex-col h-full bg-[#FAFBFC]">
        <div className="flex-1 overflow-y-auto px-6 md:px-10 py-8">
          <button
            onClick={() => navigate("/dashboard/manajemen-role")}
            className="flex items-center gap-2 text-gray-500 hover:text-[#2D7344] mb-6 font-semibold text-sm transition-colors"
          >
            <ChevronLeft size={16} /> Kembali ke Manajemen Role
          </button>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 max-w-3xl">
            <div className="p-6 border-b border-gray-50">
              <h1 className="text-xl font-bold text-gray-900">
                Tambah Role Baru
              </h1>
              <p className="text-sm text-gray-500">
                Anda dapat menambahkan satu atau beberapa role sekaligus.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {roleInputs.map((input, index) => (
                <div key={index} className="flex items-end gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Nama Role {index + 1}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Admin Desa"
                      value={input.name}
                      onChange={(e) => handleChange(index, e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-[#2D7344]"
                    />
                  </div>
                  {roleInputs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveInput(index)}
                      className="p-3 text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors mb-[1px]"
                      title="Hapus Baris"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddInput}
                className="flex items-center gap-2 text-sm font-bold text-[#2D7344] hover:text-[#1E5230] mt-4"
              >
                <Plus size={16} /> Tambah Baris Role Lain
              </button>

              <div className="pt-6 mt-6 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/dashboard/manajemen-role")}
                  className="px-6 py-2.5 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-[#2D7344] hover:bg-[#1E5230] rounded-lg transition-colors disabled:opacity-70"
                >
                  {createMutation.isPending ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
};

export default CreateRole;
