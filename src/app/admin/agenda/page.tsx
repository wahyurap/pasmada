"use client";

import { useEffect, useState, useCallback } from "react";

interface AgendaFormFieldsProps {
  form: AgendaForm;
  setForm: React.Dispatch<React.SetStateAction<AgendaForm>>;
}

function AgendaFormFields({ form, setForm }: AgendaFormFieldsProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Judul <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={form.judul}
          onChange={(e) => setForm((p) => ({ ...p, judul: e.target.value }))}
          required
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#991B1B]/30"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Deskripsi <span className="text-red-500">*</span>
        </label>
        <textarea
          value={form.deskripsi}
          onChange={(e) => setForm((p) => ({ ...p, deskripsi: e.target.value }))}
          required
          rows={3}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#991B1B]/30 resize-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tanggal & Waktu <span className="text-red-500">*</span>
        </label>
        <input
          type="datetime-local"
          value={form.tanggal}
          onChange={(e) => setForm((p) => ({ ...p, tanggal: e.target.value }))}
          required
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#991B1B]/30"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Lokasi <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={form.lokasi}
          onChange={(e) => setForm((p) => ({ ...p, lokasi: e.target.value }))}
          required
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#991B1B]/30"
        />
      </div>
    </div>
  );
}

interface Agenda {
  id: string;
  judul: string;
  deskripsi: string;
  tanggal: string;
  lokasi: string;
}

interface Meta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface AgendaForm {
  judul: string;
  deskripsi: string;
  tanggal: string;
  lokasi: string;
}

const emptyForm: AgendaForm = {
  judul: "",
  deskripsi: "",
  tanggal: "",
  lokasi: "",
};

export default function AdminAgendaPage() {
  const [agenda, setAgenda] = useState<Agenda[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const [showTambahModal, setShowTambahModal] = useState(false);
  const [tambahForm, setTambahForm] = useState<AgendaForm>(emptyForm);
  const [tambahLoading, setTambahLoading] = useState(false);

  const [editTarget, setEditTarget] = useState<Agenda | null>(null);
  const [editForm, setEditForm] = useState<AgendaForm>(emptyForm);
  const [editLoading, setEditLoading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Agenda | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const fetchAgenda = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/agenda?page=${page}&limit=10`);
      if (res.ok) {
        const data = await res.json();
        setAgenda(data.data || []);
        setMeta(data.meta);
      }
    } catch (error) {
      console.error("Error fetching agenda:", error);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchAgenda();
  }, [fetchAgenda]);

  function showSuccess(msg: string) {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  }

  async function handleTambah(e: React.FormEvent) {
    e.preventDefault();
    setTambahLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/agenda", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          judul: tambahForm.judul,
          deskripsi: tambahForm.deskripsi,
          tanggal: tambahForm.tanggal,
          lokasi: tambahForm.lokasi,
        }),
      });
      if (res.ok) {
        setShowTambahModal(false);
        setTambahForm(emptyForm);
        showSuccess("Agenda berhasil ditambahkan");
        fetchAgenda();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Gagal menambahkan agenda");
      }
    } catch {
      setErrorMsg("Terjadi kesalahan jaringan");
    } finally {
      setTambahLoading(false);
    }
  }

  function openEditModal(a: Agenda) {
    setEditTarget(a);
    // Convert ISO date to datetime-local format (YYYY-MM-DDTHH:mm)
    const dt = new Date(a.tanggal);
    const local = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setEditForm({
      judul: a.judul,
      deskripsi: a.deskripsi,
      tanggal: local,
      lokasi: a.lokasi,
    });
    setErrorMsg("");
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editTarget) return;
    setEditLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch(`/api/agenda/${editTarget.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          judul: editForm.judul,
          deskripsi: editForm.deskripsi,
          tanggal: editForm.tanggal,
          lokasi: editForm.lokasi,
        }),
      });
      if (res.ok) {
        setEditTarget(null);
        showSuccess("Agenda berhasil diperbarui");
        fetchAgenda();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Gagal memperbarui agenda");
      }
    } catch {
      setErrorMsg("Terjadi kesalahan jaringan");
    } finally {
      setEditLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/agenda/${deleteTarget.id}`, { method: "DELETE" });
      if (res.ok) {
        setDeleteTarget(null);
        showSuccess("Agenda berhasil dihapus");
        fetchAgenda();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Gagal menghapus agenda");
        setDeleteTarget(null);
      }
    } catch {
      setErrorMsg("Terjadi kesalahan jaringan");
      setDeleteTarget(null);
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manajemen Agenda</h2>
          <p className="text-gray-500 mt-1">
            {meta ? `Total: ${meta.total} agenda` : ""}
          </p>
        </div>
        <button
          onClick={() => { setShowTambahModal(true); setErrorMsg(""); }}
          className="px-4 py-2 text-sm font-medium text-white bg-[#991B1B] rounded-lg hover:bg-blue-800 transition flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Agenda
        </button>
      </div>

      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          {successMsg}
        </div>
      )}
      {errorMsg && !showTambahModal && !editTarget && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {errorMsg}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Judul</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Tanggal</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Lokasi</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-gray-400">
                    Memuat data...
                  </td>
                </tr>
              ) : agenda.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-gray-400">
                    Belum ada agenda
                  </td>
                </tr>
              ) : (
                agenda.map((a) => (
                  <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-medium text-gray-800 max-w-[200px] truncate">
                      {a.judul}
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {new Date(a.tanggal).toLocaleString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-[150px] truncate">{a.lokasi}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(a)}
                          className="px-3 py-1.5 text-xs font-medium text-[#991B1B] bg-red-50 rounded-lg hover:bg-red-100 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteTarget(a)}
                          className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Halaman {meta.page} dari {meta.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition"
              >
                Sebelumnya
              </button>
              <button
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={page >= meta.totalPages}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition"
              >
                Berikutnya
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tambah Modal */}
      {showTambahModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-5">Tambah Agenda</h3>
            <form onSubmit={handleTambah}>
              <AgendaFormFields form={tambahForm} setForm={setTambahForm} />
              {errorMsg && (
                <p className="text-sm text-red-600 mt-3">{errorMsg}</p>
              )}
              <div className="flex gap-3 mt-5">
                <button
                  type="button"
                  onClick={() => { setShowTambahModal(false); setTambahForm(emptyForm); }}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={tambahLoading}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[#991B1B] rounded-lg hover:bg-blue-800 disabled:opacity-50 transition"
                >
                  {tambahLoading ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-5">Edit Agenda</h3>
            <form onSubmit={handleEdit}>
              <AgendaFormFields form={editForm} setForm={setEditForm} />
              {errorMsg && (
                <p className="text-sm text-red-600 mt-3">{errorMsg}</p>
              )}
              <div className="flex gap-3 mt-5">
                <button
                  type="button"
                  onClick={() => setEditTarget(null)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[#991B1B] rounded-lg hover:bg-blue-800 disabled:opacity-50 transition"
                >
                  {editLoading ? "Menyimpan..." : "Perbarui"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Hapus Agenda</h3>
            <p className="text-sm text-gray-600 mb-6">
              Apakah Anda yakin ingin menghapus agenda{" "}
              <strong>&quot;{deleteTarget.judul}&quot;</strong>? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 transition"
              >
                {deleteLoading ? "Menghapus..." : "Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
