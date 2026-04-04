"use client";

import { useState, useRef } from "react";
import Link from "next/link";

const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - 1970 + 1 }, (_, i) => currentYear - i);

export default function RegisterPage() {
  const [form, setForm] = useState({
    nama: "",
    email: "",
    password: "",
    konfirmasiPassword: "",
    namaLengkap: "",
    tahunLulus: "",
    pekerjaan: "",
    alamat: "",
    noHp: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const passwordRef = useRef<HTMLInputElement>(null);
  const konfirmasiRef = useRef<HTMLInputElement>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Read directly from DOM to handle browser autofill
    const password = passwordRef.current?.value ?? form.password;
    const konfirmasiPassword = konfirmasiRef.current?.value ?? form.konfirmasiPassword;

    if (password !== konfirmasiPassword) {
      setError("Password dan konfirmasi password tidak cocok.");
      return;
    }

    if (password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama: form.nama,
          email: form.email,
          password,
          namaLengkap: form.namaLengkap,
          tahunLulus: form.tahunLulus ? parseInt(form.tahunLulus) : null,
          pekerjaan: form.pekerjaan,
          alamat: form.alamat,
          noHp: form.noHp || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Terjadi kesalahan saat mendaftar.");
      } else {
        setSuccess(true);
      }
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Pendaftaran Berhasil!</h2>
        <p className="text-gray-600 mb-6">
          Silakan cek email Anda untuk memverifikasi akun. Periksa juga folder
          spam jika email tidak ditemukan di inbox.
        </p>
        <Link
          href="/login"
          className="inline-block bg-[#991B1B] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-[#7F1D1D] transition"
        >
          Ke Halaman Masuk
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
        Daftar Akun
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="nama" className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
          <input
            id="nama" name="nama" type="text" required
            value={form.nama} onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#991B1B] focus:border-transparent outline-none transition"
            placeholder="Nama panggilan"
          />
        </div>

        <div>
          <label htmlFor="namaLengkap" className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
          <input
            id="namaLengkap" name="namaLengkap" type="text" required
            value={form.namaLengkap} onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#991B1B] focus:border-transparent outline-none transition"
            placeholder="Nama lengkap Anda"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            id="email" name="email" type="email" required
            value={form.email} onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#991B1B] focus:border-transparent outline-none transition"
            placeholder="alamat@email.com"
          />
        </div>

        <div>
          <label htmlFor="tahunLulus" className="block text-sm font-medium text-gray-700 mb-1">Tahun Lulus</label>
          <select
            id="tahunLulus" name="tahunLulus"
            value={form.tahunLulus} onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#991B1B] focus:border-transparent outline-none transition bg-white"
          >
            <option value="">Pilih tahun lulus</option>
            {years.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="pekerjaan" className="block text-sm font-medium text-gray-700 mb-1">Pekerjaan</label>
          <input
            id="pekerjaan" name="pekerjaan" type="text" required
            value={form.pekerjaan} onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#991B1B] focus:border-transparent outline-none transition"
            placeholder="Contoh: Dokter, Guru, Wiraswasta"
          />
        </div>

        <div>
          <label htmlFor="alamat" className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
          <input
            id="alamat" name="alamat" type="text" required
            value={form.alamat} onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#991B1B] focus:border-transparent outline-none transition"
            placeholder="Kota / Kabupaten tempat tinggal"
          />
        </div>

        <div>
          <label htmlFor="noHp" className="block text-sm font-medium text-gray-700 mb-1">
            No. HP <span className="text-gray-400 font-normal">(opsional)</span>
          </label>
          <input
            id="noHp" name="noHp" type="tel"
            value={form.noHp} onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#991B1B] focus:border-transparent outline-none transition"
            placeholder="08xxxxxxxxxx"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            id="password" name="password" type="password" required autoComplete="new-password"
            ref={passwordRef}
            value={form.password} onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#991B1B] focus:border-transparent outline-none transition"
            placeholder="Minimal 8 karakter"
          />
        </div>

        <div>
          <label htmlFor="konfirmasiPassword" className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password</label>
          <input
            id="konfirmasiPassword" name="konfirmasiPassword" type="password" required autoComplete="new-password"
            ref={konfirmasiRef}
            value={form.konfirmasiPassword} onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#991B1B] focus:border-transparent outline-none transition"
            placeholder="Ulangi password"
          />
        </div>

        <button
          type="submit" disabled={loading}
          className="w-full bg-[#991B1B] text-white py-2.5 rounded-lg font-medium hover:bg-[#7F1D1D] transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Memproses..." : "Daftar"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        Sudah punya akun?{" "}
        <Link href="/login" className="text-[#991B1B] font-medium hover:underline">
          Masuk di sini
        </Link>
      </p>
    </div>
  );
}
