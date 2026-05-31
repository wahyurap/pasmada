"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface Topic {
  id: string;
  judul: string;
  deskripsi: string;
  isLocked: boolean;
  createdAt: string;
  updatedAt: string;
  author: { id: string; nama: string };
  _count: { komentar: number };
}

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "baru saja";
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins} menit lalu`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} jam lalu`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days} hari lalu`;
  return new Date(date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

export default function MarkomburListPage() {
  const { data: session, status } = useSession();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ judul: "", deskripsi: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchTopics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/markombur");
      if (res.ok) {
        const json = await res.json();
        setTopics(json.data || []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  function openCreate() {
    if (!session) {
      window.location.href = "/login?callbackUrl=/markombur";
      return;
    }
    setForm({ judul: "", deskripsi: "" });
    setError("");
    setModalOpen(true);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.judul.trim() || !form.deskripsi.trim()) {
      setError("Judul dan deskripsi wajib diisi");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/markombur", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal membuat topik");
      }
      setModalOpen(false);
      fetchTopics();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <section className="ulos-hero relative py-12 overflow-hidden">
        <div className="absolute inset-0 batak-pattern" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Markombur</h1>
              <p className="mt-2 text-red-200">
                Ruang diskusi alumni — nimbrung di topik apa pun
              </p>
            </div>
            <button
              onClick={openCreate}
              className="self-start sm:self-auto px-5 py-2.5 bg-[#D97706] hover:bg-amber-500 text-white text-sm font-semibold rounded-lg transition shadow"
            >
              + Topik Baru
            </button>
          </div>
        </div>
        <div className="ulos-band mt-6" />
      </section>

      <section className="py-8 bg-gray-50 min-h-[60vh]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-[#991B1B] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : topics.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <p className="text-gray-500">Belum ada topik diskusi.</p>
              <p className="text-sm text-gray-400 mt-1">Jadilah yang pertama memulai diskusi!</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {topics.map((t) => (
                <li key={t.id}>
                  <Link
                    href={`/markombur/${t.id}`}
                    className="block p-5 bg-white rounded-xl border border-gray-100 hover:border-[#991B1B] hover:shadow-md transition"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#991B1B] text-white flex items-center justify-center font-semibold text-sm">
                        {t.author.nama.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-gray-900">{t.judul}</h3>
                          {t.isLocked && (
                            <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                              Terkunci
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-gray-600 line-clamp-2">{t.deskripsi}</p>
                        <p className="mt-2 text-xs text-gray-400">
                          {t.author.nama} &middot; {timeAgo(t.createdAt)}
                          {t._count.komentar > 0 && (
                            <span className="ml-2 inline-flex items-center gap-1 text-[#991B1B]">
                              &middot; 💬 {t._count.komentar} komentar
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Mulai Topik Baru</h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleCreate} className="px-6 py-5 space-y-4">
              {error && <div className="px-3 py-2 bg-red-50 text-red-700 text-sm rounded-lg">{error}</div>}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Judul Topik <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.judul}
                  onChange={(e) => setForm({ ...form, judul: e.target.value })}
                  placeholder="Contoh: Kelulusan SNBP Smansa 2026"
                  maxLength={200}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#991B1B] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Deskripsi <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={form.deskripsi}
                  onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                  rows={5}
                  placeholder="Ceritakan apa yang ingin didiskusikan..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#991B1B] focus:border-transparent resize-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#991B1B] text-white text-sm font-medium rounded-lg hover:bg-[#7F1D1D] disabled:opacity-50"
                >
                  {submitting ? "Membuat..." : "Buat Topik"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {!session && status !== "loading" && (
        <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-xl p-3 text-xs text-gray-600 border border-gray-200 z-40">
          <Link href="/login?callbackUrl=/markombur" className="text-[#991B1B] font-medium hover:underline">
            Login
          </Link>{" "}
          untuk ikut berdiskusi
        </div>
      )}
    </>
  );
}
