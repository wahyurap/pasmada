"use client";

import { useState, useEffect, useCallback } from "react";

type SubmissionType = "BERITA" | "AGENDA" | "ALBUM" | "SETTINGS";
type SubmissionStatus = "PENDING" | "APPROVED" | "REJECTED";

interface Submission {
  id: string;
  type: SubmissionType;
  status: SubmissionStatus;
  data: string;
  adminNote?: string | null;
  createdAt: string;
  user: { id: string; nama: string; email: string };
}

const TYPE_LABELS: Record<SubmissionType, string> = {
  BERITA: "Berita",
  AGENDA: "Agenda",
  ALBUM: "Album",
  SETTINGS: "Pengaturan",
};

const TYPE_COLORS: Record<SubmissionType, string> = {
  BERITA: "bg-blue-100 text-blue-800",
  AGENDA: "bg-purple-100 text-purple-800",
  ALBUM: "bg-indigo-100 text-indigo-800",
  SETTINGS: "bg-gray-100 text-gray-700",
};

const STATUS_TABS: SubmissionStatus[] = ["PENDING", "APPROVED", "REJECTED"];
const STATUS_LABEL: Record<SubmissionStatus, string> = {
  PENDING: "Menunggu",
  APPROVED: "Disetujui",
  REJECTED: "Ditolak",
};

function getPreview(type: SubmissionType, dataStr: string): string {
  try {
    const d = JSON.parse(dataStr);
    if (type === "SETTINGS") return `Pengaturan ${d.section === "tentang" ? "Tentang" : "Kontak"}`;
    return d.judul || "-";
  } catch {
    return "-";
  }
}

function isEditSubmission(dataStr: string): boolean {
  try { return !!JSON.parse(dataStr).editTargetId; } catch { return false; }
}

function getEditLabel(type: SubmissionType, dataStr: string): string {
  try {
    const d = JSON.parse(dataStr);
    if (!d.editTargetId) return "";
    if (type === "ALBUM") return "Tambah Foto";
    return "Edit";
  } catch { return ""; }
}

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<SubmissionStatus>("PENDING");
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/submissions?status=${activeTab}&limit=50`);
      if (res.ok) {
        const json = await res.json();
        setSubmissions(json.data || []);
      }
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  async function handleAction(id: string, action: "approve" | "reject", adminNote?: string) {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/submissions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, adminNote }),
      });
      if (res.ok) {
        setRejectingId(null);
        setRejectNote("");
        fetchSubmissions();
      }
    } finally {
      setActionLoading(null);
    }
  }

  const pendingCount = submissions.filter((s) => s.status === "PENDING").length;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Pengajuan Konten</h1>
          {activeTab === "PENDING" && pendingCount > 0 && (
            <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold bg-[#991B1B] text-white rounded-full">
              {pendingCount}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-1">Review dan kelola pengajuan konten dari alumni.</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
              activeTab === tab ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {STATUS_LABEL[tab]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-[#991B1B] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : submissions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-400 text-sm">Tidak ada pengajuan dengan status ini.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((s) => {
            const isRejecting = rejectingId === s.id;
            return (
              <div key={s.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${TYPE_COLORS[s.type]}`}>
                          {TYPE_LABELS[s.type]}
                        </span>
                        {isEditSubmission(s.data) && (
                          <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700">
                            {getEditLabel(s.type, s.data)}
                          </span>
                        )}
                        <span className="text-sm font-medium text-gray-900 truncate">{getPreview(s.type, s.data)}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>{s.user.nama}</span>
                        <span>·</span>
                        <span>{s.user.email}</span>
                        <span>·</span>
                        <span>
                          {new Date(s.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
                          })}
                        </span>
                      </div>
                      {s.adminNote && (
                        <div className="mt-2 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg">
                          Catatan: {s.adminNote}
                        </div>
                      )}
                    </div>

                    {activeTab === "PENDING" && (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleAction(s.id, "approve")}
                          disabled={actionLoading === s.id}
                          className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 disabled:opacity-60 transition"
                        >
                          {actionLoading === s.id ? "..." : "Setujui"}
                        </button>
                        <button
                          onClick={() => { setRejectingId(s.id); setRejectNote(""); }}
                          disabled={actionLoading === s.id}
                          className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 disabled:opacity-60 transition"
                        >
                          Tolak
                        </button>
                      </div>
                    )}
                  </div>

                  {isRejecting && (
                    <div className="mt-4 border-t border-gray-100 pt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Catatan penolakan (opsional)</label>
                      <textarea
                        rows={2}
                        value={rejectNote}
                        onChange={(e) => setRejectNote(e.target.value)}
                        placeholder="Jelaskan alasan penolakan..."
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleAction(s.id, "reject", rejectNote)}
                          disabled={actionLoading === s.id}
                          className="px-4 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 disabled:opacity-60 transition"
                        >
                          {actionLoading === s.id ? "Memproses..." : "Konfirmasi Tolak"}
                        </button>
                        <button
                          onClick={() => setRejectingId(null)}
                          className="px-4 py-1.5 border border-gray-200 text-xs text-gray-600 rounded-lg hover:bg-gray-50 transition"
                        >
                          Batal
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
