"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface FormValues {
  namaLengkap: string;
  tahunLulus: string;
  pekerjaan: string;
  alamat: string;
  noHp: string;
}

const CURRENT_YEAR = new Date().getFullYear();

const tahunOptions: number[] = [];
for (let y = CURRENT_YEAR; y >= 1970; y--) {
  tahunOptions.push(y);
}

export default function EditProfilPage() {
  const router = useRouter();

  const [form, setForm] = useState<FormValues>({
    namaLengkap: "",
    tahunLulus: "",
    pekerjaan: "",
    alamat: "",
    noHp: "",
  });

  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Pre-fill form on mount
  useEffect(() => {
    async function fetchProfil() {
      try {
        const res = await fetch("/api/profil");
        if (!res.ok) throw new Error("Gagal memuat profil");
        const data = await res.json();
        setForm({
          namaLengkap: data.alumni?.namaLengkap || data.nama || "",
          tahunLulus: data.alumni?.tahunLulus
            ? String(data.alumni.tahunLulus)
            : "",
          pekerjaan: data.alumni?.pekerjaan || "",
          alamat: data.alumni?.alamat || "",
          noHp: data.alumni?.noHp || "",
        });
      } catch {
        setError("Gagal memuat data profil. Silakan muat ulang halaman.");
      } finally {
        setLoadingData(false);
      }
    }
    fetchProfil();
  }, []);

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/profil", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          namaLengkap: form.namaLengkap,
          tahunLulus: form.tahunLulus ? parseInt(form.tahunLulus) : undefined,
          pekerjaan: form.pekerjaan,
          alamat: form.alamat,
          noHp: form.noHp,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal menyimpan perubahan");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/profil");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#991B1B] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Memuat data profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* Page heading */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Edit Profil</h1>
          <p className="text-sm text-gray-500 mt-1">
            Perbarui informasi profil alumni Anda
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="h-2 bg-[#991B1B]" />

          <form onSubmit={handleSubmit} className="px-6 py-8 space-y-5">
            {/* Success message */}
            {success && (
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
                <svg
                  className="w-5 h-5 shrink-0 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>
                  Profil berhasil diperbarui! Mengalihkan ke halaman profil...
                </span>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                <svg
                  className="w-5 h-5 shrink-0 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Nama Lengkap */}
            <div>
              <label
                htmlFor="namaLengkap"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <input
                id="namaLengkap"
                name="namaLengkap"
                type="text"
                required
                value={form.namaLengkap}
                onChange={handleChange}
                placeholder="Masukkan nama lengkap"
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#991B1B] focus:border-transparent"
              />
            </div>

            {/* Tahun Lulus */}
            <div>
              <label
                htmlFor="tahunLulus"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Tahun Lulus
              </label>
              <select
                id="tahunLulus"
                name="tahunLulus"
                value={form.tahunLulus}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#991B1B] focus:border-transparent bg-white"
              >
                <option value="">-- Pilih Tahun Lulus --</option>
                {tahunOptions.map((y) => (
                  <option key={y} value={String(y)}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            {/* Pekerjaan */}
            <div>
              <label
                htmlFor="pekerjaan"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Pekerjaan
              </label>
              <input
                id="pekerjaan"
                name="pekerjaan"
                type="text"
                value={form.pekerjaan}
                onChange={handleChange}
                placeholder="Contoh: Software Engineer di PT. XYZ"
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#991B1B] focus:border-transparent"
              />
            </div>

            {/* Alamat */}
            <div>
              <label
                htmlFor="alamat"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Alamat
              </label>
              <textarea
                id="alamat"
                name="alamat"
                rows={3}
                value={form.alamat}
                onChange={handleChange}
                placeholder="Masukkan alamat tinggal saat ini"
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#991B1B] focus:border-transparent resize-none"
              />
            </div>

            {/* No HP */}
            <div>
              <label
                htmlFor="noHp"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                No. HP / WhatsApp
              </label>
              <input
                id="noHp"
                name="noHp"
                type="tel"
                value={form.noHp}
                onChange={handleChange}
                placeholder="Contoh: 08123456789"
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#991B1B] focus:border-transparent"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting || success}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#991B1B] text-white text-sm font-medium rounded-lg hover:bg-[#7F1D1D] disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                {submitting && (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                {submitting ? "Menyimpan..." : "Simpan Perubahan"}
              </button>

              <Link
                href="/profil"
                className="px-6 py-2.5 border border-gray-200 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Batal
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
