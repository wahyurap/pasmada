"use client";

import { useEffect, useState } from "react";

interface Settings {
  namaOrganisasi: string | null;
  deskripsi: string | null;
  sambutanKetua: string | null;
  heroImage: string | null;
  alamat: string | null;
  email: string | null;
  telepon: string | null;
  facebook: string | null;
  instagram: string | null;
  youtube: string | null;
}

export default function AdminPengaturanPage() {
  const [form, setForm] = useState<Settings>({
    namaOrganisasi: "",
    deskripsi: "",
    sambutanKetua: "",
    heroImage: "",
    alamat: "",
    email: "",
    telepon: "",
    facebook: "",
    instagram: "",
    youtube: "",
  });
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data: Settings = await res.json();
          setForm({
            namaOrganisasi: data.namaOrganisasi || "",
            deskripsi: data.deskripsi || "",
            sambutanKetua: data.sambutanKetua || "",
            heroImage: data.heroImage || "",
            alamat: data.alamat || "",
            email: data.email || "",
            telepon: data.telepon || "",
            facebook: data.facebook || "",
            instagram: data.instagram || "",
            youtube: data.youtube || "",
          });
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
        setErrorMsg("Gagal memuat pengaturan");
      } finally {
        setFetchLoading(false);
      }
    }
    fetchSettings();
  }, []);

  function setField(key: keyof Settings, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaveLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      let heroImageUrl = form.heroImage;

      if (heroImageFile) {
        const fd = new FormData();
        fd.append("file", heroImageFile);
        const uploadRes = await fetch("/api/upload", { method: "POST", body: fd });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          heroImageUrl = uploadData.url || uploadData.path || "";
        } else {
          setErrorMsg("Gagal mengupload hero image");
          setSaveLoading(false);
          return;
        }
      }

      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          namaOrganisasi: form.namaOrganisasi,
          deskripsi: form.deskripsi,
          sambutanKetua: form.sambutanKetua,
          heroImage: heroImageUrl,
          alamat: form.alamat,
          email: form.email,
          telepon: form.telepon,
          facebook: form.facebook,
          instagram: form.instagram,
          youtube: form.youtube,
        }),
      });

      if (res.ok) {
        setSuccessMsg("Pengaturan berhasil disimpan");
        setHeroImageFile(null);
        setTimeout(() => setSuccessMsg(""), 4000);
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Gagal menyimpan pengaturan");
      }
    } catch {
      setErrorMsg("Terjadi kesalahan jaringan");
    } finally {
      setSaveLoading(false);
    }
  }

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1e40af]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Pengaturan Situs</h2>
        <p className="text-gray-500 mt-1">Kelola informasi dan tampilan situs PASMADA</p>
      </div>

      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informasi Umum */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
          <h3 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-3">
            Informasi Umum
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Organisasi
            </label>
            <input
              type="text"
              value={form.namaOrganisasi || ""}
              onChange={(e) => setField("namaOrganisasi", e.target.value)}
              placeholder="Nama organisasi alumni"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e40af]/30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deskripsi
            </label>
            <textarea
              value={form.deskripsi || ""}
              onChange={(e) => setField("deskripsi", e.target.value)}
              rows={3}
              placeholder="Deskripsi singkat organisasi"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e40af]/30 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sambutan Ketua
            </label>
            <textarea
              value={form.sambutanKetua || ""}
              onChange={(e) => setField("sambutanKetua", e.target.value)}
              rows={6}
              placeholder="Tulis sambutan dari ketua organisasi..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e40af]/30 resize-y"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload Hero Image
            </label>
            {form.heroImage && !heroImageFile && (
              <p className="text-xs text-gray-500 mb-2">
                Gambar saat ini:{" "}
                <span className="font-medium">{form.heroImage.split("/").pop()}</span>
              </p>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setHeroImageFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-[#1e40af] hover:file:bg-blue-100"
            />
            {heroImageFile && (
              <p className="text-xs text-gray-500 mt-1">File dipilih: {heroImageFile.name}</p>
            )}
          </div>
        </div>

        {/* Kontak */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
          <h3 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-3">
            Informasi Kontak
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alamat
            </label>
            <textarea
              value={form.alamat || ""}
              onChange={(e) => setField("alamat", e.target.value)}
              rows={2}
              placeholder="Alamat lengkap"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e40af]/30 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={form.email || ""}
                onChange={(e) => setField("email", e.target.value)}
                placeholder="info@example.com"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e40af]/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telepon
              </label>
              <input
                type="text"
                value={form.telepon || ""}
                onChange={(e) => setField("telepon", e.target.value)}
                placeholder="+62..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e40af]/30"
              />
            </div>
          </div>
        </div>

        {/* Media Sosial */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
          <h3 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-3">
            Media Sosial
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Facebook URL
            </label>
            <input
              type="url"
              value={form.facebook || ""}
              onChange={(e) => setField("facebook", e.target.value)}
              placeholder="https://facebook.com/..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e40af]/30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <svg className="w-4 h-4 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
              Instagram URL
            </label>
            <input
              type="url"
              value={form.instagram || ""}
              onChange={(e) => setField("instagram", e.target.value)}
              placeholder="https://instagram.com/..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e40af]/30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z" />
              </svg>
              YouTube URL
            </label>
            <input
              type="url"
              value={form.youtube || ""}
              onChange={(e) => setField("youtube", e.target.value)}
              placeholder="https://youtube.com/..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e40af]/30"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saveLoading}
            className="px-6 py-2.5 text-sm font-medium text-white bg-[#1e40af] rounded-lg hover:bg-blue-800 disabled:opacity-50 transition flex items-center gap-2"
          >
            {saveLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Menyimpan...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Simpan Pengaturan
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
