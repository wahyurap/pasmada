"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface AlumniData {
  namaLengkap: string;
  tahunLulus: number;
  pekerjaan?: string | null;
  alamat?: string | null;
  noHp?: string | null;
}

interface ProfilData {
  id: string;
  nama: string;
  email: string;
  role: string;
  alumni?: AlumniData | null;
}

const avatarColors = [
  "bg-blue-600",
  "bg-indigo-600",
  "bg-violet-600",
  "bg-emerald-600",
  "bg-rose-600",
  "bg-amber-600",
  "bg-teal-600",
  "bg-cyan-600",
];

function getAvatarColor(initial: string): string {
  const index = initial.toUpperCase().charCodeAt(0) % avatarColors.length;
  return avatarColors[index];
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-4 py-3 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500 sm:w-36 shrink-0">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value}</span>
    </div>
  );
}

export default function ProfilPage() {
  const [profil, setProfil] = useState<ProfilData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProfil() {
      try {
        const res = await fetch("/api/profil");
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Gagal memuat profil");
        }
        const data: ProfilData = await res.json();
        setProfil(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      } finally {
        setLoading(false);
      }
    }
    fetchProfil();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#1e40af] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Memuat profil...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl border border-red-100 p-8 max-w-sm w-full text-center">
          <p className="text-red-600 font-medium mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 text-sm bg-[#1e40af] text-white rounded-lg hover:bg-[#1e3a8a] transition"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  if (!profil) return null;

  const displayName = profil.alumni?.namaLengkap || profil.nama;
  const initial = displayName.charAt(0).toUpperCase();
  const colorClass = getAvatarColor(initial);

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* Page heading */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Profil Saya</h1>
          <p className="text-sm text-gray-500 mt-1">
            Informasi akun dan data alumni Anda
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Top accent */}
          <div className="h-2 bg-[#1e40af]" />

          {/* Avatar + identity */}
          <div className="px-6 pt-8 pb-6 flex flex-col sm:flex-row items-center sm:items-start gap-5 border-b border-gray-100">
            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center shrink-0 ${colorClass}`}
            >
              <span className="text-white font-bold text-3xl">{initial}</span>
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-xl font-bold text-gray-900">{displayName}</h2>
              <div className="flex flex-wrap gap-2 mt-2 justify-center sm:justify-start">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-[#1e40af]">
                  Alumni
                </span>
                {profil.alumni?.tahunLulus && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                    Angkatan {profil.alumni.tahunLulus}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="px-6 py-4">
            <DetailRow label="Email" value={profil.email} />
            <DetailRow
              label="Nama Lengkap"
              value={profil.alumni?.namaLengkap || profil.nama}
            />
            <DetailRow
              label="Tahun Lulus"
              value={profil.alumni?.tahunLulus ?? "-"}
            />
            <DetailRow
              label="Pekerjaan"
              value={profil.alumni?.pekerjaan || "-"}
            />
            <DetailRow label="Alamat" value={profil.alumni?.alamat || "-"} />
            {profil.alumni?.noHp && (
              <DetailRow label="No. HP" value={profil.alumni.noHp} />
            )}
          </div>

          {/* Action */}
          <div className="px-6 pb-6 pt-2">
            <Link
              href="/profil/edit"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1e40af] text-white text-sm font-medium rounded-lg hover:bg-[#1e3a8a] transition"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Edit Profil
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
