"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

interface Berita {
  id: string;
  judul: string;
  penulis: string;
  published: boolean;
  createdAt: string;
}

interface Meta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminBeritaPage() {
  const [berita, setBerita] = useState<Berita[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Berita | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toggleLoading, setToggleLoading] = useState<string | null>(null);

  const fetchBerita = useCallback(async () => {
    setLoading(true);
    try {
      // Admin fetches all (including drafts) — the API returns published only for guests,
      // but session cookie is sent automatically so the server can distinguish.
      // We add a query param so the server knows this is an admin request.
      const res = await fetch(`/api/berita?page=${page}&limit=10&all=true`);
      if (res.ok) {
        const data = await res.json();
        setBerita(data.data || []);
        setMeta(data.meta);
      }
    } catch (error) {
      console.error("Error fetching berita:", error);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchBerita();
  }, [fetchBerita]);

  async function handleTogglePublish(b: Berita) {
    setToggleLoading(b.id);
    setErrorMsg("");
    try {
      const res = await fetch(`/api/berita/${b.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !b.published }),
      });
      if (res.ok) {
        setSuccessMsg(`Berita "${b.judul}" berhasil ${!b.published ? "dipublikasikan" : "dijadikan draft"}`);
        setTimeout(() => setSuccessMsg(""), 3000);
        fetchBerita();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Gagal mengubah status");
      }
    } catch {
      setErrorMsg("Terjadi kesalahan jaringan");
    } finally {
      setToggleLoading(null);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/berita/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDeleteTarget(null);
        setSuccessMsg("Berita berhasil dihapus");
        setTimeout(() => setSuccessMsg(""), 3000);
        fetchBerita();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Gagal menghapus berita");
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
          <h2 className="text-2xl font-bold text-gray-900">Manajemen Berita</h2>
          <p className="text-gray-500 mt-1">
            {meta ? `Total: ${meta.total} berita` : ""}
          </p>
        </div>
        <Link
          href="/admin/berita/tambah"
          className="px-4 py-2 text-sm font-medium text-white bg-[#991B1B] rounded-lg hover:bg-blue-800 transition flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Berita
        </Link>
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

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Judul</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Penulis</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Tanggal</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-gray-400">
                    Memuat data...
                  </td>
                </tr>
              ) : berita.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-gray-400">
                    Belum ada berita
                  </td>
                </tr>
              ) : (
                berita.map((b) => (
                  <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-medium text-gray-800 max-w-[220px] truncate">
                      {b.judul}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{b.penulis}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          b.published
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {b.published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {new Date(b.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 flex-wrap">
                        <Link
                          href={`/admin/berita/${b.id}/edit`}
                          className="px-3 py-1.5 text-xs font-medium text-[#991B1B] bg-red-50 rounded-lg hover:bg-red-100 transition"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleTogglePublish(b)}
                          disabled={toggleLoading === b.id}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition disabled:opacity-50 ${
                            b.published
                              ? "text-yellow-700 bg-yellow-50 hover:bg-yellow-100"
                              : "text-green-700 bg-green-50 hover:bg-green-100"
                          }`}
                        >
                          {toggleLoading === b.id
                            ? "..."
                            : b.published
                            ? "Jadikan Draft"
                            : "Publikasikan"}
                        </button>
                        <button
                          onClick={() => setDeleteTarget(b)}
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

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Hapus Berita</h3>
            <p className="text-sm text-gray-600 mb-6">
              Apakah Anda yakin ingin menghapus berita{" "}
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
