"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface BeritaData {
  id: string;
  judul: string;
  ringkasan: string | null;
  konten: string;
  penulis: string;
  gambar: string | null;
  published: boolean;
}

export default function EditBeritaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const router = useRouter();

  const [form, setForm] = useState({
    judul: "",
    ringkasan: "",
    konten: "",
    penulis: "",
    gambar: "",
    published: false,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchBerita() {
      try {
        const res = await fetch(`/api/berita/${id}`);
        if (res.ok) {
          const data: BeritaData = await res.json();
          setForm({
            judul: data.judul,
            ringkasan: data.ringkasan || "",
            konten: data.konten,
            penulis: data.penulis,
            gambar: data.gambar || "",
            published: data.published,
          });
        } else if (res.status === 404) {
          setNotFound(true);
        }
      } catch (error) {
        console.error("Error fetching berita:", error);
        setErrorMsg("Gagal memuat data berita");
      } finally {
        setFetchLoading(false);
      }
    }
    fetchBerita();
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      let gambarUrl = form.gambar;

      if (imageFile) {
        const fd = new FormData();
        fd.append("file", imageFile);
        const uploadRes = await fetch("/api/upload", { method: "POST", body: fd });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          gambarUrl = uploadData.url || uploadData.path || "";
        } else {
          setErrorMsg("Gagal mengupload gambar");
          setLoading(false);
          return;
        }
      }

      const res = await fetch(`/api/berita/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          judul: form.judul,
          ringkasan: form.ringkasan,
          konten: form.konten,
          gambar: gambarUrl || null,
          published: form.published,
        }),
      });

      if (res.ok) {
        router.push("/admin/berita");
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Gagal memperbarui berita");
      }
    } catch {
      setErrorMsg("Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  }

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1e40af]"></div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 text-lg">Berita tidak ditemukan</p>
        <Link href="/admin/berita" className="mt-4 inline-block text-[#1e40af] hover:underline text-sm">
          Kembali ke daftar berita
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/berita"
          className="p-2 text-gray-500 hover:text-[#1e40af] hover:bg-blue-50 rounded-lg transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Edit Berita</h2>
          <p className="text-gray-500 mt-0.5 text-sm">Perbarui artikel berita</p>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Judul <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.judul}
            onChange={(e) => setForm({ ...form, judul: e.target.value })}
            required
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e40af]/30"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Penulis
          </label>
          <input
            type="text"
            value={form.penulis}
            onChange={(e) => setForm({ ...form, penulis: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e40af]/30"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ringkasan
            <span className="text-gray-400 font-normal ml-1">
              ({form.ringkasan.length}/200)
            </span>
          </label>
          <textarea
            value={form.ringkasan}
            onChange={(e) => setForm({ ...form, ringkasan: e.target.value.slice(0, 200) })}
            rows={3}
            maxLength={200}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e40af]/30 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Konten <span className="text-red-500">*</span>
          </label>
          <textarea
            value={form.konten}
            onChange={(e) => setForm({ ...form, konten: e.target.value })}
            required
            rows={12}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e40af]/30 resize-y"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Upload Gambar Baru
          </label>
          {form.gambar && !imageFile && (
            <p className="text-xs text-gray-500 mb-2">
              Gambar saat ini:{" "}
              <span className="font-medium">{form.gambar.split("/").pop()}</span>
            </p>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-[#1e40af] hover:file:bg-blue-100"
          />
          {imageFile && (
            <p className="text-xs text-gray-500 mt-1">File dipilih: {imageFile.name}</p>
          )}
        </div>

        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            role="switch"
            aria-checked={form.published}
            onClick={() => setForm({ ...form, published: !form.published })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
              form.published ? "bg-[#1e40af]" : "bg-gray-200"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                form.published ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
          <span className="text-sm font-medium text-gray-700">
            {form.published ? "Dipublikasikan" : "Draft"}
          </span>
        </div>

        <div className="flex gap-3 pt-2 border-t border-gray-100">
          <Link
            href="/admin/berita"
            className="flex-1 text-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[#1e40af] rounded-lg hover:bg-blue-800 disabled:opacity-50 transition"
          >
            {loading ? "Menyimpan..." : "Perbarui Berita"}
          </button>
        </div>
      </form>
    </div>
  );
}
