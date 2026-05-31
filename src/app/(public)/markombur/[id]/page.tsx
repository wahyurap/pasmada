"use client";

import { useEffect, useState, useCallback, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface Komentar {
  id: string;
  konten: string;
  createdAt: string;
  authorId: string;
  author: { id: string; nama: string };
}

interface Topic {
  id: string;
  judul: string;
  deskripsi: string;
  isLocked: boolean;
  createdAt: string;
  author: { id: string; nama: string };
  authorId: string;
  komentar: Komentar[];
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

export default function MarkomburDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: session } = useSession();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const [komentarText, setKomentarText] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");
  const [reportModal, setReportModal] = useState<{ topicId?: string; komentarId?: string } | null>(null);
  const [reportAlasan, setReportAlasan] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  const isAdmin = (session?.user as { role?: string } | undefined)?.role === "ADMIN";
  const userId = (session?.user as { id?: string } | undefined)?.id;

  const fetchTopic = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/markombur/${id}`);
      if (res.ok) {
        const json = await res.json();
        setTopic(json);
      } else if (res.status === 404) {
        router.push("/markombur");
      }
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchTopic();
  }, [fetchTopic]);

  async function handleComment(e: React.FormEvent) {
    e.preventDefault();
    if (!komentarText.trim()) return;
    if (!session) {
      window.location.href = `/login?callbackUrl=/markombur/${id}`;
      return;
    }
    setPosting(true);
    setError("");
    try {
      const res = await fetch(`/api/markombur/${id}/komentar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ konten: komentarText }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal mengirim komentar");
      }
      setKomentarText("");
      fetchTopic();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan");
    } finally {
      setPosting(false);
    }
  }

  async function handleDeleteTopic() {
    if (!confirm("Hapus topik ini beserta semua komentarnya?")) return;
    const res = await fetch(`/api/markombur/${id}`, { method: "DELETE" });
    if (res.ok) router.push("/markombur");
  }

  async function handleDeleteKomentar(komentarId: string) {
    if (!confirm("Hapus komentar ini?")) return;
    const res = await fetch(`/api/markombur/${id}/komentar/${komentarId}`, { method: "DELETE" });
    if (res.ok) fetchTopic();
  }

  async function submitReport(e: React.FormEvent) {
    e.preventDefault();
    if (!reportAlasan.trim()) return;
    if (!session) {
      window.location.href = `/login?callbackUrl=/markombur/${id}`;
      return;
    }
    setReportSubmitting(true);
    try {
      const res = await fetch("/api/markombur/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...reportModal, alasan: reportAlasan }),
      });
      if (res.ok) {
        setReportSuccess(true);
        setReportAlasan("");
        setTimeout(() => {
          setReportModal(null);
          setReportSuccess(false);
        }, 1500);
      }
    } finally {
      setReportSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <div className="w-8 h-8 border-4 border-[#991B1B] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!topic) return null;

  return (
    <>
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/markombur" className="text-sm text-[#991B1B] hover:underline">
            &larr; Kembali ke daftar topik
          </Link>
          <div className="mt-4 flex items-start justify-between gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{topic.judul}</h1>
            <div className="flex flex-col gap-1 items-end">
              {session && (
                <button
                  onClick={() => setReportModal({ topicId: topic.id })}
                  className="text-xs text-gray-400 hover:text-red-600"
                  title="Laporkan topik"
                >
                  🚩 Laporkan
                </button>
              )}
              {isAdmin && (
                <button
                  onClick={handleDeleteTopic}
                  className="text-xs text-red-500 hover:underline"
                >
                  Hapus
                </button>
              )}
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-500">
            Oleh {topic.author.nama} &middot; {timeAgo(topic.createdAt)}
          </p>
          <div className="mt-4 prose prose-sm max-w-none text-gray-700 whitespace-pre-line">
            {topic.deskripsi}
          </div>
        </div>
      </div>

      <section className="py-8 bg-gray-50 min-h-[40vh]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-semibold text-gray-900 mb-4">
            {topic.komentar.length} Komentar
          </h2>

          {topic.komentar.length > 0 && (
            <ul className="space-y-3 mb-6">
              {topic.komentar.map((k) => {
                const canDelete = isAdmin || k.authorId === userId;
                return (
                  <li key={k.id} className="p-4 bg-white rounded-xl border border-gray-100">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#991B1B] text-white flex items-center justify-center font-semibold text-xs">
                        {k.author.nama.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium text-gray-900">
                            {k.author.nama}
                            <span className="ml-2 text-xs text-gray-400 font-normal">
                              {timeAgo(k.createdAt)}
                            </span>
                          </p>
                          <div className="flex gap-2 items-center">
                            {session && k.authorId !== userId && (
                              <button
                                onClick={() => setReportModal({ komentarId: k.id })}
                                className="text-xs text-gray-300 hover:text-red-600"
                                title="Laporkan"
                              >
                                🚩
                              </button>
                            )}
                            {canDelete && (
                              <button
                                onClick={() => handleDeleteKomentar(k.id)}
                                className="text-xs text-gray-300 hover:text-red-600"
                                title="Hapus"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="mt-1 text-sm text-gray-700 whitespace-pre-line">{k.konten}</p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {topic.isLocked ? (
            <div className="p-4 bg-gray-100 rounded-xl text-center text-sm text-gray-600">
              Topik ini dikunci. Komentar baru tidak diterima.
            </div>
          ) : session ? (
            <form onSubmit={handleComment} className="bg-white rounded-xl border border-gray-100 p-4">
              {error && <div className="mb-2 px-3 py-2 bg-red-50 text-red-700 text-sm rounded-lg">{error}</div>}
              <textarea
                value={komentarText}
                onChange={(e) => setKomentarText(e.target.value)}
                rows={3}
                placeholder="Tulis komentar..."
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#991B1B] focus:border-transparent resize-none"
              />
              <div className="mt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={posting || !komentarText.trim()}
                  className="px-4 py-2 bg-[#991B1B] text-white text-sm font-medium rounded-lg hover:bg-[#7F1D1D] disabled:opacity-50"
                >
                  {posting ? "Mengirim..." : "Kirim"}
                </button>
              </div>
            </form>
          ) : (
            <div className="p-4 bg-white rounded-xl border border-gray-100 text-center">
              <Link href={`/login?callbackUrl=/markombur/${id}`} className="text-[#991B1B] font-medium hover:underline">
                Login
              </Link>{" "}
              <span className="text-sm text-gray-600">untuk ikut berkomentar</span>
            </div>
          )}
        </div>
      </section>

      {reportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Laporkan ke Admin</h3>
            </div>
            <form onSubmit={submitReport} className="px-6 py-5 space-y-3">
              {reportSuccess ? (
                <div className="text-center py-4">
                  <p className="text-green-600 font-medium">Laporan terkirim. Terima kasih!</p>
                </div>
              ) : (
                <>
                  <label className="block text-sm font-medium text-gray-700">Alasan</label>
                  <textarea
                    value={reportAlasan}
                    onChange={(e) => setReportAlasan(e.target.value)}
                    rows={3}
                    placeholder="Contoh: spam, kata kasar, konten tidak pantas..."
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#991B1B] resize-none"
                  />
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => { setReportModal(null); setReportAlasan(""); }}
                      className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={reportSubmitting || !reportAlasan.trim()}
                      className="px-5 py-2 bg-[#991B1B] text-white text-sm font-medium rounded-lg hover:bg-[#7F1D1D] disabled:opacity-50"
                    >
                      {reportSubmitting ? "Mengirim..." : "Kirim Laporan"}
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}
    </>
  );
}
