"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";

interface Foto {
  id: string;
  url: string;
  caption: string | null;
  createdAt: string;
}

interface Album {
  id: string;
  judul: string;
  deskripsi: string | null;
  fotos: Foto[];
}

export default function AdminAlbumDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);

  const [album, setAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Upload state
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [caption, setCaption] = useState("");
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Delete state
  const [deleteFotoTarget, setDeleteFotoTarget] = useState<Foto | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const fetchAlbum = useCallback(async () => {
    try {
      const res = await fetch(`/api/galeri/${id}`);
      if (res.ok) {
        const data = await res.json();
        setAlbum(data);
      } else if (res.status === 404) {
        setNotFound(true);
      }
    } catch (error) {
      console.error("Error fetching album:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAlbum();
  }, [fetchAlbum]);

  function showSuccess(msg: string) {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFiles || selectedFiles.length === 0) return;

    setUploadLoading(true);
    setErrorMsg("");
    setUploadProgress(0);

    try {
      const files = Array.from(selectedFiles);
      let successCount = 0;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fd = new FormData();
        fd.append("file", file);
        fd.append("caption", caption);

        const res = await fetch(`/api/galeri/${id}/foto`, {
          method: "POST",
          body: fd,
        });

        if (res.ok) {
          successCount++;
        }
        setUploadProgress(Math.round(((i + 1) / files.length) * 100));
      }

      if (successCount > 0) {
        setSelectedFiles(null);
        setCaption("");
        // Reset file input
        const fileInput = document.getElementById("foto-upload") as HTMLInputElement;
        if (fileInput) fileInput.value = "";
        showSuccess(`${successCount} foto berhasil diupload`);
        fetchAlbum();
      } else {
        setErrorMsg("Gagal mengupload foto");
      }
    } catch {
      setErrorMsg("Terjadi kesalahan saat upload");
    } finally {
      setUploadLoading(false);
      setUploadProgress(0);
    }
  }

  async function handleDeleteFoto() {
    if (!deleteFotoTarget) return;
    setDeleteLoading(true);
    try {
      // NOTE: Requires DELETE /api/galeri/[id]/foto/[fotoId] endpoint
      const res = await fetch(`/api/galeri/${id}/foto/${deleteFotoTarget.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDeleteFotoTarget(null);
        showSuccess("Foto berhasil dihapus");
        fetchAlbum();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Gagal menghapus foto");
        setDeleteFotoTarget(null);
      }
    } catch {
      setErrorMsg("Terjadi kesalahan jaringan");
      setDeleteFotoTarget(null);
    } finally {
      setDeleteLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1e40af]"></div>
      </div>
    );
  }

  if (notFound || !album) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 text-lg">Album tidak ditemukan</p>
        <Link href="/admin/galeri" className="mt-4 inline-block text-[#1e40af] hover:underline text-sm">
          Kembali ke galeri
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/galeri"
          className="p-2 text-gray-500 hover:text-[#1e40af] hover:bg-blue-50 rounded-lg transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{album.judul}</h2>
          <p className="text-gray-500 mt-0.5 text-sm">
            {album.fotos.length} foto
            {album.deskripsi && ` · ${album.deskripsi}`}
          </p>
        </div>
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

      {/* Upload Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Foto</h3>
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pilih Foto <span className="text-red-500">*</span>
            </label>
            <input
              id="foto-upload"
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setSelectedFiles(e.target.files)}
              required
              className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-[#1e40af] hover:file:bg-blue-100"
            />
            {selectedFiles && selectedFiles.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {selectedFiles.length} file dipilih
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Caption
            </label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Caption untuk foto (opsional)"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e40af]/30"
            />
          </div>
          {uploadLoading && uploadProgress > 0 && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-[#1e40af] h-2 rounded-full transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
          <button
            type="submit"
            disabled={uploadLoading || !selectedFiles || selectedFiles.length === 0}
            className="px-5 py-2 text-sm font-medium text-white bg-[#1e40af] rounded-lg hover:bg-blue-800 disabled:opacity-50 transition"
          >
            {uploadLoading ? `Mengupload... ${uploadProgress}%` : "Upload Foto"}
          </button>
        </form>
      </div>

      {/* Photo Grid */}
      {album.fotos.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-400">Belum ada foto di album ini</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {album.fotos.map((foto) => (
            <div
              key={foto.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group"
            >
              <div className="relative h-40 bg-gray-100">
                <Image
                  src={foto.url}
                  alt={foto.caption || "Foto"}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-3">
                {foto.caption && (
                  <p className="text-xs text-gray-600 truncate mb-2">{foto.caption}</p>
                )}
                <button
                  onClick={() => setDeleteFotoTarget(foto)}
                  className="w-full px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Foto Confirm Modal */}
      {deleteFotoTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Hapus Foto</h3>
            <p className="text-sm text-gray-600 mb-6">
              Apakah Anda yakin ingin menghapus foto ini?
              {deleteFotoTarget.caption && (
                <span className="font-medium"> &quot;{deleteFotoTarget.caption}&quot;</span>
              )}{" "}
              Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteFotoTarget(null)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteFoto}
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
