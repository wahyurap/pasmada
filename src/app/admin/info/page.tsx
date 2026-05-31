"use client";

import { useEffect, useState, useCallback } from "react";

type Kategori = "LOKER" | "USAHA" | "AGEN" | "LAINNYA";

interface Info {
  id: string;
  judul: string;
  kategori: Kategori;
  ringkasan: string;
  konten: string;
  gambar: string | null;
  kontak: string | null;
  link: string | null;
  expiredAt: string | null;
  published: boolean;
  createdAt: string;
}

interface FormState {
  judul: string;
  kategori: Kategori;
  ringkasan: string;
  konten: string;
  gambar: string;
  kontak: string;
  link: string;
  expiredAt: string;
  published: boolean;
}

const KATEGORI_LABEL: Record<Kategori, string> = {
  LOKER: "Lowongan Kerja",
  USAHA: "Usaha Alumni",
  AGEN: "Agen",
  LAINNYA: "Lainnya",
};

const emptyForm: FormState = {
  judul: "",
  kategori: "LOKER",
  ringkasan: "",
  konten: "",
  gambar: "",
  kontak: "",
  link: "",
  expiredAt: "",
  published: true,
};

const inputCls =
  "w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#991B1B] focus:border-transparent";

export default function AdminInfoPage() {
  const [items, setItems] = useState<Info[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/info?limit=100");
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

  function openEdit(item: Info) {
    setEditingId(item.id);
    setForm({
      judul: item.judul,
      kategori: item.kategori,
      ringkasan: item.ringkasan,
      konten: item.konten,
      gambar: item.gambar || "",
      kontak: item.kontak || "",
      link: item.link || "",
      expiredAt: item.expiredAt ? item.expiredAt.slice(0, 10) : "",
      published: item.published,
    });
    setError("");
    setModalOpen(true);
  }

  async function handleGambarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("subdir", "info");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (res.ok) {
        const data = await res.json();
        setForm((p) => ({ ...p, gambar: data.url }));
      } else {
        setError("Gagal upload gambar");
      }
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.judul || !form.ringkasan || !form.konten) {
      setError("Judul, ringkasan, dan konten wajib diisi");
      return;
    }
    setSaving(true);
    try {
      const url = editingId ? `/api/info/${editingId}` : "/api/info";
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
    if (!confirm("Hapus info ini? Tindakan tidak bisa dibatalkan.")) return;
    const res = await fetch(`/api/info/${id}`, { method: "DELETE" });
    if (res.ok) fetchItems();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Info</h1>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-[#991B1B] text-white text-sm font-medium rounded-lg hover:bg-[#7F1D1D] transition"
        >
          + Tambah Info
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-[#991B1B] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <p className="text-center py-12 text-gray-400 text-sm">Belum ada info.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3 text-left">Judul</th>
                <th className="px-6 py-3 text-left">Kategori</th>
                <th className="px-6 py-3 text-left">Berlaku s/d</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 font-medium text-gray-900 max-w-xs truncate">{item.judul}</td>
                  <td className="px-6 py-3 text-gray-600">{KATEGORI_LABEL[item.kategori]}</td>
                  <td className="px-6 py-3 text-gray-500">
                    {item.expiredAt
                      ? new Date(item.expiredAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
                      : "-"}
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        item.published ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {item.published ? "Publish" : "Draft"}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right space-x-2">
                    <button onClick={() => openEdit(item)} className="text-[#991B1B] hover:underline text-xs font-medium">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:underline text-xs font-medium">
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
                {editingId ? "Edit Info" : "Tambah Info"}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              {error && <div className="px-3 py-2 bg-red-50 text-red-700 text-sm rounded-lg">{error}</div>}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Judul *</label>
                  <input type="text" value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Kategori *</label>
                  <select value={form.kategori} onChange={(e) => setForm({ ...form, kategori: e.target.value as Kategori })} className={inputCls}>
                    {Object.entries(KATEGORI_LABEL).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Ringkasan *</label>
                <textarea value={form.ringkasan} onChange={(e) => setForm({ ...form, ringkasan: e.target.value })} rows={2} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Konten *</label>
                <textarea value={form.konten} onChange={(e) => setForm({ ...form, konten: e.target.value })} rows={8} className={inputCls} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Kontak (HP/Email/WA)</label>
                  <input type="text" value={form.kontak} onChange={(e) => setForm({ ...form, kontak: e.target.value })} className={inputCls} placeholder="0812..." />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Tautan (opsional)</label>
                  <input type="url" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} className={inputCls} placeholder="https://..." />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Berlaku Sampai (opsional)</label>
                <input type="date" value={form.expiredAt} onChange={(e) => setForm({ ...form, expiredAt: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Gambar</label>
                <div className="flex items-center gap-3">
                  {form.gambar && <img src={form.gambar} alt="" className="w-20 h-20 rounded-lg object-cover" />}
                  <input type="file" accept="image/*" onChange={handleGambarUpload} disabled={uploading} className="text-sm" />
                  {uploading && <span className="text-xs text-gray-500">Mengupload...</span>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="info-published" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
                <label htmlFor="info-published" className="text-sm text-gray-700">Publikasikan</label>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
                  Batal
                </button>
                <button type="submit" disabled={saving} className="px-5 py-2 bg-[#991B1B] text-white text-sm font-medium rounded-lg hover:bg-[#7F1D1D] disabled:opacity-50">
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
