"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";

interface Album {
  id: string;
  judul: string;
  deskripsi: string | null;
  coverImage: string | null;
  createdAt: string;
  _count: { fotos: number };
}

export default function AdminGaleriPage() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);

  const [showTambahModal, setShowTambahModal] = useState(false);
  const [tambahForm, setTambahForm] = useState({ judul: "", deskripsi: "" });
  const [tambahLoading, setTambahLoading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Album | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const fetchAlbums = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/galeri?limit=50");
      if (res.ok) {
        const data = await res.json();
        setAlbums(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching albums:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlbums();
  }, [fetchAlbums]);

  function showSuccess(msg: string) {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  }

  async function handleTambah(e: React.FormEvent) {
    e.preventDefault();
    setTambahLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/galeri", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          judul: tambahForm.judul,
          deskripsi: tambahForm.deskripsi || null,
        }),
      });
      if (res.ok) {
        setShowTambahModal(false);
        setTambahForm({ judul: "", deskripsi: "" });
        showSuccess("Album berhasil ditambahkan");
        fetchAlbums();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Gagal menambahkan album");
      }
    } catch {
      setErrorMsg("Terjadi kesalahan jaringan");
    } finally {
      setTambahLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/galeri/${deleteTarget.id}`, { method: "DELETE" });
      if (res.ok) {
        setDeleteTarget(null);
        showSuccess("Album berhasil dihapus");
        fetchAlbums();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Gagal menghapus album");
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
          <h2 className="text-2xl font-bold text-gray-900">Manajemen Galeri</h2>
          <p className="text-gray-500 mt-1">{albums.length} album</p>
        </div>
        <button
          onClick={() => { setShowTambahModal(true); setErrorMsg(""); }}
          className="px-4 py-2 text-sm font-medium text-white bg-[#1e40af] rounded-lg hover:bg-blue-800 transition flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Album
        </button>
      </div>

      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          {successMsg}
        </div>
      )}
      {errorMsg && !showTambahModal && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {errorMsg}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1e40af]"></div>
        </div>
      ) : albums.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-400">Belum ada album galeri</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {albums.map((album) => (
            <div
              key={album.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            >
              {/* Cover image */}
              <div className="relative h-40 bg-gray-100">
                {album.coverImage ? (
                  <Image
                    src={album.coverImage}
                    alt={album.judul}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
                  {album._count.fotos} foto
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-gray-800 truncate">{album.judul}</h3>
                {album.deskripsi && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{album.deskripsi}</p>
                )}
                <div className="flex gap-2 mt-3">
                  <Link
                    href={`/admin/galeri/${album.id}`}
                    className="flex-1 text-center px-3 py-1.5 text-xs font-medium text-[#1e40af] bg-blue-50 rounded-lg hover:bg-blue-100 transition"
                  >
                    Lihat Foto
                  </Link>
                  <button
                    onClick={() => setDeleteTarget(album)}
                    className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tambah Album Modal */}
      {showTambahModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-5">Tambah Album</h3>
            <form onSubmit={handleTambah} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Judul Album <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={tambahForm.judul}
                  onChange={(e) => setTambahForm({ ...tambahForm, judul: e.target.value })}
                  required
                  placeholder="Nama album"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e40af]/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deskripsi
                </label>
                <textarea
                  value={tambahForm.deskripsi}
                  onChange={(e) => setTambahForm({ ...tambahForm, deskripsi: e.target.value })}
                  rows={3}
                  placeholder="Deskripsi album (opsional)"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e40af]/30 resize-none"
                />
              </div>
              {errorMsg && (
                <p className="text-sm text-red-600">{errorMsg}</p>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowTambahModal(false); setTambahForm({ judul: "", deskripsi: "" }); }}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={tambahLoading}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[#1e40af] rounded-lg hover:bg-blue-800 disabled:opacity-50 transition"
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Hapus Album</h3>
            <p className="text-sm text-gray-600 mb-6">
              Apakah Anda yakin ingin menghapus album{" "}
              <strong>&quot;{deleteTarget.judul}&quot;</strong> beserta semua fotonya? Tindakan ini tidak dapat dibatalkan.
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
