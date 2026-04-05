"use client";

import { useEffect, useState, useCallback } from "react";

interface Alumni {
  id: string;
  namaLengkap: string;
  tahunLulus: number;
  pekerjaan: string | null;
  alamat: string | null;
  noHp: string | null;
}

interface Meta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface EditForm {
  namaLengkap: string;
  tahunLulus: string;
  pekerjaan: string;
  alamat: string;
  noHp: string;
}

export default function AdminAlumniPage() {
  const [alumni, setAlumni] = useState<Alumni[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tahunFilter, setTahunFilter] = useState("");
  const [page, setPage] = useState(1);

  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ inserted: number; skipped: number; total: number } | null>(null);

  const [showTambahModal, setShowTambahModal] = useState(false);
  const [tambahForm, setTambahForm] = useState<EditForm>({
    namaLengkap: "",
    tahunLulus: "",
    pekerjaan: "",
    alamat: "",
    noHp: "",
  });
  const [tambahLoading, setTambahLoading] = useState(false);

  const [editTarget, setEditTarget] = useState<Alumni | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({
    namaLengkap: "",
    tahunLulus: "",
    pekerjaan: "",
    alamat: "",
    noHp: "",
  });
  const [editLoading, setEditLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Alumni | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const fetchAlumni = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "10",
      });
      if (search) params.set("q", search);
      if (tahunFilter) params.set("tahun", tahunFilter);

      const res = await fetch(`/api/admin/alumni?${params}`);
      if (res.ok) {
        const data = await res.json();
        setAlumni(data.data || []);
        setMeta(data.meta);
      }
    } catch (error) {
      console.error("Error fetching alumni:", error);
    } finally {
      setLoading(false);
    }
  }, [page, search, tahunFilter]);

  useEffect(() => {
    fetchAlumni();
  }, [fetchAlumni]);

  function openEditModal(a: Alumni) {
    setEditTarget(a);
    setEditForm({
      namaLengkap: a.namaLengkap,
      tahunLulus: String(a.tahunLulus),
      pekerjaan: a.pekerjaan || "",
      alamat: a.alamat || "",
      noHp: a.noHp || "",
    });
    setErrorMsg("");
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editTarget) return;
    setEditLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch(`/api/admin/alumni/${editTarget.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          namaLengkap: editForm.namaLengkap,
          tahunLulus: editForm.tahunLulus,
          pekerjaan: editForm.pekerjaan,
          alamat: editForm.alamat,
          noHp: editForm.noHp,
        }),
      });
      if (res.ok) {
        setEditTarget(null);
        setSuccessMsg("Data alumni berhasil diperbarui");
        setTimeout(() => setSuccessMsg(""), 3000);
        fetchAlumni();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Gagal memperbarui data");
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
      const res = await fetch(`/api/admin/alumni/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDeleteTarget(null);
        setSuccessMsg("Alumni berhasil dihapus");
        setTimeout(() => setSuccessMsg(""), 3000);
        fetchAlumni();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Gagal menghapus alumni");
        setDeleteTarget(null);
      }
    } catch {
      setErrorMsg("Terjadi kesalahan jaringan");
      setDeleteTarget(null);
    } finally {
      setDeleteLoading(false);
    }
  }

  async function handleTambah(e: React.FormEvent) {
    e.preventDefault();
    setTambahLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/admin/alumni", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tambahForm),
      });
      if (res.ok) {
        setShowTambahModal(false);
        setTambahForm({ namaLengkap: "", tahunLulus: "", pekerjaan: "", alamat: "", noHp: "" });
        setSuccessMsg("Alumni berhasil ditambahkan");
        setTimeout(() => setSuccessMsg(""), 3000);
        fetchAlumni();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Gagal menambahkan alumni");
      }
    } catch {
      setErrorMsg("Terjadi kesalahan jaringan");
    } finally {
      setTambahLoading(false);
    }
  }

  async function handleImport(e: React.FormEvent) {
    e.preventDefault();
    if (!importFile) return;
    setImporting(true);
    setImportResult(null);
    setSuccessMsg("");
    setErrorMsg("");
    try {
      const fd = new FormData();
      fd.append("file", importFile);
      const res = await fetch("/api/admin/alumni/import", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok) {
        setImportResult(data);
        setImportFile(null);
        fetchAlumni();
      } else {
        setErrorMsg(data.error || "Gagal mengimpor data");
      }
    } catch {
      setErrorMsg("Terjadi kesalahan saat mengimpor");
    } finally {
      setImporting(false);
    }
  }

  const currentYear = new Date().getFullYear();
  const tahunOptions = Array.from({ length: 30 }, (_, i) => currentYear - i);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manajemen Alumni</h2>
          <p className="text-gray-500 mt-1">
            {meta ? `Total: ${meta.total} alumni` : ""}
          </p>
        </div>
        <button
          onClick={() => { setShowTambahModal(true); setErrorMsg(""); }}
          className="px-4 py-2 text-sm font-medium text-white bg-[#991B1B] rounded-lg hover:bg-red-800 transition"
        >
          + Tambah Alumni
        </button>
      </div>

      {/* Import Excel */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-blue-900 mb-3">Import Alumni dari Excel</h3>
        <p className="text-xs text-blue-700 mb-3">
          Kolom yang dikenali: <strong>Nama Lengkap</strong>, <strong>Tahun Lulus</strong>, <strong>No HP</strong>, <strong>Pekerjaan</strong>
        </p>
        <form onSubmit={handleImport} className="flex items-center gap-3">
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
            className="text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-white file:text-blue-700 hover:file:bg-blue-50"
          />
          <button
            type="submit"
            disabled={!importFile || importing}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 disabled:opacity-50 transition"
          >
            {importing ? "Mengimpor..." : "Import"}
          </button>
        </form>
        {importResult && (
          <p className="mt-3 text-sm text-green-700 font-medium">
            Berhasil import {importResult.inserted} dari {importResult.total} data
            {importResult.skipped > 0 && ` (${importResult.skipped} dilewati karena data tidak valid)`}
          </p>
        )}
      </div>

      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {errorMsg}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Cari nama alumni..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#991B1B]/30"
        />
        <select
          value={tahunFilter}
          onChange={(e) => { setTahunFilter(e.target.value); setPage(1); }}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#991B1B]/30 bg-white"
        >
          <option value="">Semua Tahun</option>
          {tahunOptions.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">No</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Nama Lengkap</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Tahun Lulus</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Pekerjaan</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Alamat</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">No HP</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-400">
                    Memuat data...
                  </td>
                </tr>
              ) : alumni.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-400">
                    Tidak ada data alumni
                  </td>
                </tr>
              ) : (
                alumni.map((a, idx) => (
                  <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-3 text-gray-500">
                      {((page - 1) * 10) + idx + 1}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">{a.namaLengkap}</td>
                    <td className="px-4 py-3 text-gray-600">{a.tahunLulus}</td>
                    <td className="px-4 py-3 text-gray-600">{a.pekerjaan || "-"}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-[150px] truncate">{a.alamat || "-"}</td>
                    <td className="px-4 py-3 text-gray-600">{a.noHp || "-"}</td>
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

        {/* Pagination */}
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

      {/* Edit Modal */}
      {editTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-5">Edit Data Alumni</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={editForm.namaLengkap}
                  onChange={(e) => setEditForm({ ...editForm, namaLengkap: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#991B1B]/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tahun Lulus
                </label>
                <input
                  type="number"
                  value={editForm.tahunLulus}
                  onChange={(e) => setEditForm({ ...editForm, tahunLulus: e.target.value })}
                  required
                  min="1950"
                  max={currentYear}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#991B1B]/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pekerjaan
                </label>
                <input
                  type="text"
                  value={editForm.pekerjaan}
                  onChange={(e) => setEditForm({ ...editForm, pekerjaan: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#991B1B]/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alamat
                </label>
                <input
                  type="text"
                  value={editForm.alamat}
                  onChange={(e) => setEditForm({ ...editForm, alamat: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#991B1B]/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  No HP
                </label>
                <input
                  type="text"
                  value={editForm.noHp}
                  onChange={(e) => setEditForm({ ...editForm, noHp: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#991B1B]/30"
                />
              </div>
              {errorMsg && (
                <p className="text-sm text-red-600">{errorMsg}</p>
              )}
              <div className="flex gap-3 pt-2">
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
                  {editLoading ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tambah Alumni Modal */}
      {showTambahModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-5">Tambah Alumni</h3>
            <form onSubmit={handleTambah} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={tambahForm.namaLengkap}
                  onChange={(e) => setTambahForm({ ...tambahForm, namaLengkap: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#991B1B]/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tahun Lulus <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={tambahForm.tahunLulus}
                  onChange={(e) => setTambahForm({ ...tambahForm, tahunLulus: e.target.value })}
                  required
                  min="1950"
                  max={currentYear}
                  placeholder="contoh: 2010"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#991B1B]/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pekerjaan</label>
                <input
                  type="text"
                  value={tambahForm.pekerjaan}
                  onChange={(e) => setTambahForm({ ...tambahForm, pekerjaan: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#991B1B]/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                <input
                  type="text"
                  value={tambahForm.alamat}
                  onChange={(e) => setTambahForm({ ...tambahForm, alamat: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#991B1B]/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">No HP</label>
                <input
                  type="text"
                  value={tambahForm.noHp}
                  onChange={(e) => setTambahForm({ ...tambahForm, noHp: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#991B1B]/30"
                />
              </div>
              {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowTambahModal(false); setErrorMsg(""); }}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={tambahLoading}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[#991B1B] rounded-lg hover:bg-red-800 disabled:opacity-50 transition"
                >
                  {tambahLoading ? "Menyimpan..." : "Simpan"}
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Hapus Alumni</h3>
            <p className="text-sm text-gray-600 mb-6">
              Apakah Anda yakin ingin menghapus alumni{" "}
              <strong>{deleteTarget.namaLengkap}</strong>? Tindakan ini tidak dapat dibatalkan.
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
