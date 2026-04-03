"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

type SubmissionType = "BERITA" | "AGENDA" | "ALBUM" | "SETTINGS";
type SubmissionStatus = "PENDING" | "APPROVED" | "REJECTED";

interface Submission {
  id: string;
  type: SubmissionType;
  status: SubmissionStatus;
  data: string;
  adminNote?: string | null;
  createdAt: string;
}

const TYPE_LABELS: Record<SubmissionType, string> = {
  BERITA: "Berita",
  AGENDA: "Agenda",
  ALBUM: "Album",
  SETTINGS: "Pengaturan",
};

const STATUS_BADGE: Record<SubmissionStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
};

const STATUS_LABEL: Record<SubmissionStatus, string> = {
  PENDING: "Menunggu",
  APPROVED: "Disetujui",
  REJECTED: "Ditolak",
};

const inputCls =
  "w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#991B1B] focus:border-transparent";

function getPreview(type: SubmissionType, dataStr: string): string {
  try {
    const d = JSON.parse(dataStr);
    if (type === "SETTINGS") return d.section === "tentang" ? "Tentang" : "Kontak";
    return d.judul || "-";
  } catch {
    return "-";
  }
}

export default function PengajuanPage() {
  const { data: session } = useSession();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalType, setModalType] = useState<SubmissionType | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [settingsTab, setSettingsTab] = useState<"tentang" | "kontak">("tentang");

  const [beritaForm, setBeritaForm] = useState({ judul: "", ringkasan: "", konten: "", penulis: "" });
  const [agendaForm, setAgendaForm] = useState({ judul: "", deskripsi: "", tanggal: "", lokasi: "" });
  const [albumForm, setAlbumForm] = useState({ judul: "", deskripsi: "" });
  const [tentangForm, setTentangForm] = useState({ sejarah: "", visi: "", misi: "" });
  const [kontakForm, setKontakForm] = useState({ alamat: "", email: "", telepon: "", facebook: "", instagram: "", youtube: "" });

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/submissions");
      if (res.ok) {
        const json = await res.json();
        setSubmissions(json.data || []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  useEffect(() => {
    if (session?.user?.name && modalType === "BERITA") {
      setBeritaForm((p) => ({ ...p, penulis: p.penulis || session.user.name || "" }));
    }
  }, [modalType, session]);

  function openModal(type: SubmissionType) {
    setModalType(type);
    setFormError("");
    setFormSuccess("");
    if (type === "BERITA") setBeritaForm({ judul: "", ringkasan: "", konten: "", penulis: session?.user?.name || "" });
    if (type === "AGENDA") setAgendaForm({ judul: "", deskripsi: "", tanggal: "", lokasi: "" });
    if (type === "ALBUM") setAlbumForm({ judul: "", deskripsi: "" });
    if (type === "SETTINGS") { setTentangForm({ sejarah: "", visi: "", misi: "" }); setKontakForm({ alamat: "", email: "", telepon: "", facebook: "", instagram: "", youtube: "" }); setSettingsTab("tentang"); }
  }

  async function handleSubmit() {
    setSubmitting(true);
    setFormError("");
    setFormSuccess("");

    let data: Record<string, string> = {};
    if (modalType === "BERITA") {
      if (!beritaForm.judul || !beritaForm.konten) { setFormError("Judul dan konten wajib diisi"); setSubmitting(false); return; }
      data = { ...beritaForm };
    } else if (modalType === "AGENDA") {
      if (!agendaForm.judul || !agendaForm.tanggal || !agendaForm.lokasi) { setFormError("Judul, tanggal, dan lokasi wajib diisi"); setSubmitting(false); return; }
      data = { ...agendaForm };
    } else if (modalType === "ALBUM") {
      if (!albumForm.judul) { setFormError("Judul wajib diisi"); setSubmitting(false); return; }
      data = { ...albumForm };
    } else if (modalType === "SETTINGS") {
      data = settingsTab === "tentang"
        ? { section: "tentang", ...tentangForm }
        : { section: "kontak", ...kontakForm };
    }

    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: modalType, data }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal mengirim pengajuan");
      }
      setFormSuccess("Pengajuan berhasil dikirim! Menunggu persetujuan admin.");
      fetchSubmissions();
      setTimeout(() => setModalType(null), 1500);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Pengajuan Konten</h1>
          <p className="text-sm text-gray-500 mt-1">Ajukan konten untuk ditampilkan di situs. Admin akan mereview sebelum dipublikasikan.</p>
        </div>

        <div className="flex flex-wrap gap-3 mb-8">
          {(["BERITA", "AGENDA", "ALBUM", "SETTINGS"] as SubmissionType[]).map((type) => (
            <button
              key={type}
              onClick={() => openModal(type)}
              className="flex items-center gap-2 px-4 py-2 bg-[#991B1B] text-white text-sm font-medium rounded-lg hover:bg-[#7F1D1D] transition"
            >
              <span className="text-base leading-none">+</span>
              {TYPE_LABELS[type]}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="h-1 bg-[#991B1B]" />
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Riwayat Pengajuan</h2>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-[#991B1B] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">Belum ada pengajuan.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3 text-left">Jenis</th>
                    <th className="px-6 py-3 text-left">Judul / Ringkasan</th>
                    <th className="px-6 py-3 text-left">Status</th>
                    <th className="px-6 py-3 text-left">Catatan Admin</th>
                    <th className="px-6 py-3 text-left">Tanggal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {submissions.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                          {TYPE_LABELS[s.type]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-700 max-w-xs truncate">{getPreview(s.type, s.data)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[s.status]}`}>
                          {STATUS_LABEL[s.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 max-w-xs truncate">{s.adminNote || "-"}</td>
                      <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                        {new Date(s.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">
                Ajukan {TYPE_LABELS[modalType]}
              </h3>
              <button onClick={() => setModalType(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{formError}</div>
              )}
              {formSuccess && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">{formSuccess}</div>
              )}

              {modalType === "BERITA" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Judul <span className="text-red-500">*</span></label>
                    <input type="text" className={inputCls} value={beritaForm.judul} onChange={(e) => setBeritaForm((p) => ({ ...p, judul: e.target.value }))} placeholder="Judul berita" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Ringkasan</label>
                    <textarea rows={2} className={inputCls + " resize-none"} value={beritaForm.ringkasan} onChange={(e) => setBeritaForm((p) => ({ ...p, ringkasan: e.target.value }))} placeholder="Ringkasan singkat berita" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Konten <span className="text-red-500">*</span></label>
                    <textarea rows={8} className={inputCls + " resize-none"} value={beritaForm.konten} onChange={(e) => setBeritaForm((p) => ({ ...p, konten: e.target.value }))} placeholder="Isi berita selengkapnya..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Penulis</label>
                    <input type="text" className={inputCls} value={beritaForm.penulis} onChange={(e) => setBeritaForm((p) => ({ ...p, penulis: e.target.value }))} placeholder="Nama penulis" />
                  </div>
                </>
              )}

              {modalType === "AGENDA" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Judul <span className="text-red-500">*</span></label>
                    <input type="text" className={inputCls} value={agendaForm.judul} onChange={(e) => setAgendaForm((p) => ({ ...p, judul: e.target.value }))} placeholder="Judul kegiatan" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Deskripsi</label>
                    <textarea rows={4} className={inputCls + " resize-none"} value={agendaForm.deskripsi} onChange={(e) => setAgendaForm((p) => ({ ...p, deskripsi: e.target.value }))} placeholder="Deskripsi kegiatan" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Tanggal & Waktu <span className="text-red-500">*</span></label>
                    <input type="datetime-local" className={inputCls} value={agendaForm.tanggal} onChange={(e) => setAgendaForm((p) => ({ ...p, tanggal: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Lokasi <span className="text-red-500">*</span></label>
                    <input type="text" className={inputCls} value={agendaForm.lokasi} onChange={(e) => setAgendaForm((p) => ({ ...p, lokasi: e.target.value }))} placeholder="Lokasi kegiatan" />
                  </div>
                </>
              )}

              {modalType === "ALBUM" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Judul <span className="text-red-500">*</span></label>
                    <input type="text" className={inputCls} value={albumForm.judul} onChange={(e) => setAlbumForm((p) => ({ ...p, judul: e.target.value }))} placeholder="Judul album" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Deskripsi</label>
                    <textarea rows={2} className={inputCls + " resize-none"} value={albumForm.deskripsi} onChange={(e) => setAlbumForm((p) => ({ ...p, deskripsi: e.target.value }))} placeholder="Deskripsi album" />
                  </div>
                </>
              )}

              {modalType === "SETTINGS" && (
                <>
                  <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                    {(["tentang", "kontak"] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setSettingsTab(tab)}
                        className={`flex-1 py-2 text-sm font-medium transition ${settingsTab === tab ? "bg-[#991B1B] text-white" : "text-gray-600 hover:bg-gray-50"}`}
                      >
                        {tab === "tentang" ? "Tentang" : "Kontak"}
                      </button>
                    ))}
                  </div>

                  {settingsTab === "tentang" ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Sejarah</label>
                        <textarea rows={6} className={inputCls + " resize-none"} value={tentangForm.sejarah} onChange={(e) => setTentangForm((p) => ({ ...p, sejarah: e.target.value }))} placeholder="Sejarah organisasi" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Visi</label>
                        <textarea rows={3} className={inputCls + " resize-none"} value={tentangForm.visi} onChange={(e) => setTentangForm((p) => ({ ...p, visi: e.target.value }))} placeholder="Visi organisasi" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Misi <span className="text-xs text-gray-400">(satu per baris)</span></label>
                        <textarea rows={4} className={inputCls + " resize-none"} value={tentangForm.misi} onChange={(e) => setTentangForm((p) => ({ ...p, misi: e.target.value }))} placeholder="Misi 1&#10;Misi 2&#10;Misi 3" />
                      </div>
                    </>
                  ) : (
                    <>
                      {[
                        { key: "alamat", label: "Alamat", placeholder: "Alamat organisasi" },
                        { key: "email", label: "Email", placeholder: "email@organisasi.id" },
                        { key: "telepon", label: "Telepon", placeholder: "08xxxxxxxxx" },
                        { key: "facebook", label: "Facebook", placeholder: "URL Facebook" },
                        { key: "instagram", label: "Instagram", placeholder: "URL Instagram" },
                        { key: "youtube", label: "YouTube", placeholder: "URL YouTube" },
                      ].map(({ key, label, placeholder }) => (
                        <div key={key}>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                          <input
                            type="text"
                            className={inputCls}
                            value={kontakForm[key as keyof typeof kontakForm]}
                            onChange={(e) => setKontakForm((p) => ({ ...p, [key]: e.target.value }))}
                            placeholder={placeholder}
                          />
                        </div>
                      ))}
                    </>
                  )}
                </>
              )}
            </div>

            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#991B1B] text-white text-sm font-medium rounded-lg hover:bg-[#7F1D1D] disabled:opacity-60 transition"
              >
                {submitting && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {submitting ? "Mengirim..." : "Kirim Pengajuan"}
              </button>
              <button
                onClick={() => setModalType(null)}
                className="px-5 py-2.5 border border-gray-200 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
