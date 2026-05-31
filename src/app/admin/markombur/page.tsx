"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

interface Report {
  id: string;
  alasan: string;
  resolved: boolean;
  createdAt: string;
  reporter: { id: string; nama: string; email: string };
  topic: { id: string; judul: string } | null;
  komentar: {
    id: string;
    konten: string;
    topicId: string;
    topic: { id: string; judul: string };
  } | null;
}

export default function AdminMarkomburPage() {
  const [tab, setTab] = useState<"pending" | "resolved">("pending");
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/markombur/report?resolved=${tab === "resolved"}`);
      if (res.ok) {
        const json = await res.json();
        setReports(json.data || []);
      }
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  async function handleResolve(id: string, deleteContent: boolean) {
    if (deleteContent && !confirm("Hapus konten yang dilaporkan?")) return;
    const res = await fetch(`/api/markombur/report/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: deleteContent ? "delete_content" : "ignore" }),
    });
    if (res.ok) fetchReports();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Moderasi Markombur</h1>
        <p className="text-sm text-gray-500 mt-1">Tinjau laporan dari user terkait konten Markombur</p>
      </div>

      <div className="flex border border-gray-200 rounded-lg overflow-hidden w-fit">
        {(["pending", "resolved"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium transition ${
              tab === t ? "bg-[#991B1B] text-white" : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            {t === "pending" ? "Belum Selesai" : "Selesai"}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-[#991B1B] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : reports.length === 0 ? (
          <p className="text-center py-12 text-gray-400 text-sm">
            {tab === "pending" ? "Tidak ada laporan yang menunggu." : "Belum ada laporan yang diselesaikan."}
          </p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {reports.map((r) => {
              const targetTopic = r.topic || r.komentar?.topic;
              return (
                <li key={r.id} className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                            r.komentar ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {r.komentar ? "Komentar" : "Topik"}
                        </span>
                        <span className="text-xs text-gray-400">
                          Dilaporkan {r.reporter.nama} &middot;{" "}
                          {new Date(r.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Alasan:</span> {r.alasan}
                      </p>
                      {targetTopic && (
                        <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                          <Link
                            href={`/markombur/${targetTopic.id}`}
                            target="_blank"
                            className="text-sm font-medium text-[#991B1B] hover:underline"
                          >
                            Topik: {targetTopic.judul}
                          </Link>
                          {r.komentar && (
                            <p className="mt-1 text-sm text-gray-600 italic">
                              &ldquo;{r.komentar.konten.slice(0, 200)}
                              {r.komentar.konten.length > 200 && "..."}&rdquo;
                            </p>
                          )}
                        </div>
                      )}
                      {!targetTopic && (
                        <p className="mt-2 text-xs text-gray-400 italic">
                          (Konten yang dilaporkan sudah dihapus)
                        </p>
                      )}
                    </div>
                    {!r.resolved && (
                      <div className="flex flex-col gap-1 flex-shrink-0">
                        <button
                          onClick={() => handleResolve(r.id, true)}
                          className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg"
                        >
                          Hapus Konten
                        </button>
                        <button
                          onClick={() => handleResolve(r.id, false)}
                          className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg"
                        >
                          Abaikan
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
