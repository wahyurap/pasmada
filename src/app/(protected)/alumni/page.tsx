"use client";

import { useState, useEffect, useCallback } from "react";
import AlumniCard from "@/components/alumni/AlumniCard";

interface Alumni {
  id: string;
  namaLengkap: string;
  tahunLulus: number;
  pekerjaan?: string;
  alamat?: string;
}

interface ApiResponse {
  data: Alumni[];
  meta: {
    total: number;
    page: number;
    totalPages: number;
  };
}

const LIMIT = 12;
const CURRENT_YEAR = new Date().getFullYear();

const tahunOptions: number[] = [];
for (let y = CURRENT_YEAR; y >= 1970; y--) {
  tahunOptions.push(y);
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-full bg-gray-200 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-200 rounded w-1/3" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded w-2/3" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
      </div>
    </div>
  );
}

export default function AlumniPage() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [tahun, setTahun] = useState("");
  const [page, setPage] = useState(1);

  const [alumni, setAlumni] = useState<Alumni[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Debounce query by 400ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  // Reset page when tahun changes
  useEffect(() => {
    setPage(1);
  }, [tahun]);

  const fetchAlumni = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        q: debouncedQuery,
        page: String(page),
        limit: String(LIMIT),
      });
      if (tahun) params.set("tahun", tahun);

      const res = await fetch(`/api/alumni?${params.toString()}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal memuat data alumni");
      }
      const json: ApiResponse = await res.json();
      setAlumni(json.data);
      setTotal(json.meta.total);
      setTotalPages(json.meta.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, tahun, page]);

  useEffect(() => {
    fetchAlumni();
  }, [fetchAlumni]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-[#1e40af] py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            Direktori Alumni
          </h1>
          <p className="mt-3 text-blue-200 text-base sm:text-lg max-w-2xl mx-auto">
            Fitur ini hanya tersedia untuk anggota terdaftar. Temukan dan
            terhubung kembali dengan sesama alumni PASMADA.
          </p>
        </div>
      </section>

      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            {/* Search input */}
            <div className="relative flex-1">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari nama alumni..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1e40af] focus:border-transparent"
              />
            </div>

            {/* Tahun Lulus filter */}
            <select
              value={tahun}
              onChange={(e) => setTahun(e.target.value)}
              className="sm:w-48 px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1e40af] focus:border-transparent"
            >
              <option value="">Semua Angkatan</option>
              {tahunOptions.map((y) => (
                <option key={y} value={String(y)}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Error state */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Loading skeleton */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: LIMIT }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : alumni.length === 0 ? (
            /* Empty state */
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-1">
                Alumni tidak ditemukan
              </h3>
              <p className="text-gray-500 text-sm">
                {debouncedQuery || tahun
                  ? "Coba ubah kata kunci atau filter pencarian."
                  : "Belum ada data alumni yang tersedia."}
              </p>
            </div>
          ) : (
            <>
              {/* Results info */}
              <p className="text-sm text-gray-500 mb-4">
                Menampilkan{" "}
                <span className="font-medium text-gray-700">
                  {(page - 1) * LIMIT + 1}–
                  {Math.min(page * LIMIT, total)}
                </span>{" "}
                dari <span className="font-medium text-gray-700">{total}</span>{" "}
                alumni
              </p>

              {/* Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {alumni.map((a) => (
                  <AlumniCard
                    key={a.id}
                    namaLengkap={a.namaLengkap}
                    tahunLulus={a.tahunLulus}
                    pekerjaan={a.pekerjaan}
                    alamat={a.alamat}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-10">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    &larr; Sebelumnya
                  </button>

                  <span className="text-sm text-gray-600">
                    Halaman{" "}
                    <span className="font-semibold text-gray-900">{page}</span>{" "}
                    dari{" "}
                    <span className="font-semibold text-gray-900">
                      {totalPages}
                    </span>
                  </span>

                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    Berikutnya &rarr;
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
