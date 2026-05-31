"use client";

import { useEffect, useState, useCallback } from "react";

interface AlumniPilihan {
  id: string;
  nama: string;
  tahunLulus: number;
  pekerjaan: string;
  foto: string | null;
  ringkasan: string;
  kisah: string;
  published: boolean;
  createdAt: string;
}

interface FormState {
  nama: string;
  tahunLulus: string;
  pekerjaan: string;
  foto: string;
  ringkasan: string;
  kisah: string;
  published: boolean;
}

const emptyForm: FormState = {
  nama: "",
  tahunLulus: "",
  pekerjaan: "",
  foto: "",
  ringkasan: "",
  kisah: "",
  published: true,
};

const inputCls =
  "w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#991B1B] focus:border-transparent";

export default function AdminProfilAlumniPage() {
  const [items, setItems] = useState<AlumniPilihan[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploadingFoto, setUploadingFoto] = useState(false);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/alumni-pilihan?limit=100");
      if (res.ok) {
        const json = await res.json();
        setItems(json.data || []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setModalOpen(true);
  }

  function openEdit(item: AlumniPilihan) {
    setEditingId(item.id);
    setForm({
      nama: item.nama,
      tahunLulus: String(item.tahunLulus),
      pekerjaan: item.pekerjaan,
      foto: item.foto || "",
      ringkasan: item.ringkasan,
      kisah: item.kisah,
      published: item.published,
    });
    setError("");
    setModalOpen(true);
  }

  async function handleFotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFoto(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("subdir", "alumni-pilihan");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (res.ok) {
        const data = await res.json();
        setForm((p) => ({ ...p, foto: data.url }));
      } else {
        setError("Gagal upload foto");
      }
    } finally {
      setUploadingFoto(false);
      e.target.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.nama || !form.tahunLulus || !form.pekerjaan || !form.ringkasan || !form.kisah) {
      setError("Nama, tahun lulus, pekerjaan, ringkasan, dan kisah wajib diisi");
      return;
    }
    setSaving(true);
    try {
      const url = editingId ? `/api/alumni-pilihan/${editingId}` : "/api/alumni-pilihan";
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal menyimpan");
      }
      setModalOpen(false);
      fetchItems();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus profil ini? Tindakan tidak bisa dibatalkan.")) return;
    const res = await fetch(`/api/alumni-pilihan/${id}`, { method: "DELETE" });
    if (res.ok) fetchItems();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Profil Alumni Pilihan</h1>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-[#991B1B] text-white text-sm font-medium rounded-lg hover:bg-[#7F1D1D] transition"
        >
          + Tambah Profil
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-[#991B1B] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <p className="text-center py-12 text-gray-400 text-sm">Belum ada profil alumni.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3 text-left">Foto</th>
                <th className="px-6 py-3 text-left">Nama</th>
                <th className="px-6 py-3 text-left">Pekerjaan</th>
                <th className="px-6 py-3 text-left">Tahun</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3">
                    {item.foto ? (
                      <img src={item.foto} alt="" className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-100" />
                    )}
                  </td>
                  <td className="px-6 py-3 font-medium text-gray-900">{item.nama}</td>
                  <td className="px-6 py-3 text-gray-600">{item.pekerjaan}</td>
                  <td className="px-6 py-3 text-gray-500">{item.tahunLulus}</td>
                  <td className="px-6 py-3">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        item.published
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {item.published ? "Publish" : "Draft"}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right space-x-2">
                    <button
                      onClick={() => openEdit(item)}
                      className="text-[#991B1B] hover:underline text-xs font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-500 hover:underline text-xs font-medium"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">
                {editingId ? "Edit Profil Alumni" : "Tambah Profil Alumni"}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              {error && (
                <div className="px-3 py-2 bg-red-50 text-red-700 text-sm rounded-lg">{error}</div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Nama Lengkap *</label>
                  <input
                    type="text"
                    value={form.nama}
                    onChange={(e) => setForm({ ...form, nama: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Tahun Lulus *</label>
                  <input
                    type="number"
                    min="1960"
                    max={new Date().getFullYear()}
                    value={form.tahunLulus}
                    onChange={(e) => setForm({ ...form, tahunLulus: e.target.value })}
                    className={inputCls}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Pekerjaan / Jabatan *</label>
                <input
                  type="text"
                  value={form.pekerjaan}
                  onChange={(e) => setForm({ ...form, pekerjaan: e.target.value })}
                  placeholder="Contoh: Dokter Spesialis Jantung, RS Pertamina"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Foto</label>
                <div className="flex items-center gap-3">
                  {form.foto && (
                    <img src={form.foto} alt="" className="w-16 h-16 rounded-full object-cover" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFotoUpload}
                    disabled={uploadingFoto}
                    className="text-sm"
                  />
                  {uploadingFoto && <span className="text-xs text-gray-500">Mengupload...</span>}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Ringkasan *</label>
                <textarea
                  value={form.ringkasan}
                  onChange={(e) => setForm({ ...form, ringkasan: e.target.value })}
                  rows={3}
                  placeholder="Ringkasan singkat untuk tampil di kartu daftar"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Kisah Perjalanan *</label>
                <textarea
                  value={form.kisah}
                  onChange={(e) => setForm({ ...form, kisah: e.target.value })}
                  rows={10}
                  placeholder="Kisah lengkap perjalanan pendidikan dan karir..."
                  className={inputCls}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="published"
                  checked={form.published}
                  onChange={(e) => setForm({ ...form, published: e.target.checked })}
                />
                <label htmlFor="published" className="text-sm text-gray-700">
                  Publikasikan di halaman publik
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#991B1B] text-white text-sm font-medium rounded-lg hover:bg-[#7F1D1D] disabled:opacity-50"
                >
                  {saving ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
