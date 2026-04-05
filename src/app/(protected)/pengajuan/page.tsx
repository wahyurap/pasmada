"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";

type SubmissionType = "BERITA" | "AGENDA" | "ALBUM" | "SETTINGS";
type EditMode = "BERITA_EDIT" | "AGENDA_EDIT" | "ALBUM_FOTO";
type ModalMode = SubmissionType | EditMode | null;
type SubmissionStatus = "PENDING" | "APPROVED" | "REJECTED";

interface Submission {
  id: string;
  type: SubmissionType;
  status: SubmissionStatus;
  data: string;
  adminNote?: string | null;
  createdAt: string;
}

interface ExistingItem {
  id: string;
  judul: string;
  ringkasan?: string | null;
  konten?: string;
  penulis?: string;
  gambar?: string | null;
  deskripsi?: string;
  tanggal?: string;
  lokasi?: string;
  _count?: { fotos: number };
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
    const prefix = d.editTargetId ? "[Edit] " : "";
    return prefix + (d.judul || "-");
  } catch {
    return "-";
  }
}

async function uploadFile(file: File, subdir?: string): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  if (subdir) fd.append("subdir", subdir);
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  if (!res.ok) throw new Error("Gagal mengupload gambar");
  const json = await res.json();
  return json.url as string;
}

export default function PengajuanPage() {
  const { data: session } = useSession();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [settingsTab, setSettingsTab] = useState<"tentang" | "kontak">("tentang");

  // Edit mode: step 1 = select existing item, step 2 = edit form
  const [editStep, setEditStep] = useState<1 | 2>(1);
  const [existingItems, setExistingItems] = useState<ExistingItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ExistingItem | null>(null);

  const [beritaForm, setBeritaForm] = useState({ judul: "", ringkasan: "", konten: "", penulis: "", gambar: "" });
  const [beritaGambarFile, setBeritaGambarFile] = useState<File | null>(null);
  const [uploadingBeritaGambar, setUploadingBeritaGambar] = useState(false);

  const [agendaForm, setAgendaForm] = useState({ judul: "", deskripsi: "", tanggal: "", lokasi: "" });
  const [albumForm, setAlbumForm] = useState({ judul: "", deskripsi: "" });
  const [albumFotos, setAlbumFotos] = useState<string[]>([]);
  const [uploadingAlbumFotos, setUploadingAlbumFotos] = useState(false);
  const albumFotoInputRef = useRef<HTMLInputElement>(null);

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
    if (session?.user?.name && modalMode === "BERITA") {
      setBeritaForm((p) => ({ ...p, penulis: p.penulis || session.user.name || "" }));
    }
  }, [modalMode, session]);

  async function loadExistingItems(mode: EditMode) {
    setLoadingItems(true);
    setExistingItems([]);
    try {
      let url = "";
      if (mode === "BERITA_EDIT") url = "/api/berita?limit=50&page=1";
      else if (mode === "AGENDA_EDIT") url = "/api/agenda?limit=50&page=1";
      else if (mode === "ALBUM_FOTO") url = "/api/galeri?limit=50&page=1";
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        setExistingItems(json.data || []);
      }
    } finally {
      setLoadingItems(false);
    }
  }

  function openModal(mode: ModalMode) {
    setModalMode(mode);
    setFormError("");
    setFormSuccess("");
    setEditStep(1);
    setSelectedItem(null);

    if (mode === "BERITA") {
      setBeritaForm({ judul: "", ringkasan: "", konten: "", penulis: session?.user?.name || "", gambar: "" });
      setBeritaGambarFile(null);
    }
    if (mode === "AGENDA") setAgendaForm({ judul: "", deskripsi: "", tanggal: "", lokasi: "" });
    if (mode === "ALBUM") { setAlbumForm({ judul: "", deskripsi: "" }); setAlbumFotos([]); }
    if (mode === "SETTINGS") {
      setTentangForm({ sejarah: "", visi: "", misi: "" });
      setKontakForm({ alamat: "", email: "", telepon: "", facebook: "", instagram: "", youtube: "" });
      setSettingsTab("tentang");
    }
    if (mode === "BERITA_EDIT" || mode === "AGENDA_EDIT" || mode === "ALBUM_FOTO") {
      loadExistingItems(mode as EditMode);
    }
  }

  function selectItemForEdit(item: ExistingItem) {
    setSelectedItem(item);
    setFormError("");
    if (modalMode === "BERITA_EDIT") {
      setBeritaForm({
        judul: item.judul || "",
        ringkasan: item.ringkasan || "",
        konten: item.konten || "",
        penulis: item.penulis || session?.user?.name || "",
        gambar: item.gambar || "",
      });
      setBeritaGambarFile(null);
    } else if (modalMode === "AGENDA_EDIT") {
      // Format datetime-local from ISO string
      let tanggalValue = "";
      if (item.tanggal) {
        const d = new Date(item.tanggal);
        tanggalValue = d.toISOString().slice(0, 16);
      }
      setAgendaForm({
        judul: item.judul || "",
        deskripsi: item.deskripsi || "",
        tanggal: tanggalValue,
        lokasi: item.lokasi || "",
      });
    } else if (modalMode === "ALBUM_FOTO") {
      setAlbumFotos([]);
    }
    setEditStep(2);
  }

  async function handleBeritaGambarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBeritaGambarFile(file);
    setUploadingBeritaGambar(true);
    try {
      const url = await uploadFile(file, "berita");
      setBeritaForm((p) => ({ ...p, gambar: url }));
    } catch {
      setFormError("Gagal mengupload gambar berita");
    } finally {
      setUploadingBeritaGambar(false);
    }
  }

  async function handleAlbumFotosChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploadingAlbumFotos(true);
    setFormError("");
    try {
      const urls = await Promise.all(files.map((f) => uploadFile(f, "galeri")));
      setAlbumFotos((prev) => [...prev, ...urls]);
    } catch {
      setFormError("Gagal mengupload beberapa foto");
    } finally {
      setUploadingAlbumFotos(false);
      if (albumFotoInputRef.current) albumFotoInputRef.current.value = "";
    }
  }

  function removeFoto(index: number) {
    setAlbumFotos((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    setSubmitting(true);
    setFormError("");
    setFormSuccess("");

    let type: SubmissionType;
    let data: Record<string, unknown> = {};

    if (modalMode === "BERITA") {
      if (!beritaForm.judul || !beritaForm.konten) { setFormError("Judul dan konten wajib diisi"); setSubmitting(false); return; }
      type = "BERITA";
      data = { ...beritaForm };
    } else if (modalMode === "BERITA_EDIT") {
      if (!beritaForm.judul || !beritaForm.konten) { setFormError("Judul dan konten wajib diisi"); setSubmitting(false); return; }
      type = "BERITA";
      data = { ...beritaForm, editTargetId: selectedItem!.id };
    } else if (modalMode === "AGENDA") {
      if (!agendaForm.judul || !agendaForm.tanggal || !agendaForm.lokasi) { setFormError("Judul, tanggal, dan lokasi wajib diisi"); setSubmitting(false); return; }
      type = "AGENDA";
      data = { ...agendaForm };
    } else if (modalMode === "AGENDA_EDIT") {
      if (!agendaForm.judul || !agendaForm.tanggal || !agendaForm.lokasi) { setFormError("Judul, tanggal, dan lokasi wajib diisi"); setSubmitting(false); return; }
      type = "AGENDA";
      data = { ...agendaForm, editTargetId: selectedItem!.id };
    } else if (modalMode === "ALBUM") {
      if (!albumForm.judul) { setFormError("Judul wajib diisi"); setSubmitting(false); return; }
      type = "ALBUM";
      data = { ...albumForm, fotos: albumFotos };
    } else if (modalMode === "ALBUM_FOTO") {
      if (albumFotos.length === 0) { setFormError("Upload minimal 1 foto"); setSubmitting(false); return; }
      type = "ALBUM";
      data = { judul: selectedItem!.judul, editTargetId: selectedItem!.id, addFotos: albumFotos };
    } else if (modalMode === "SETTINGS") {
      type = "SETTINGS";
      data = settingsTab === "tentang"
        ? { section: "tentang", ...tentangForm }
        : { section: "kontak", ...kontakForm };
    } else {
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, data }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal mengirim pengajuan");
      }
      setFormSuccess("Pengajuan berhasil dikirim! Menunggu persetujuan admin.");
      fetchSubmissions();
      setTimeout(() => setModalMode(null), 1500);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setSubmitting(false);
    }
  }

  const isEditMode = modalMode === "BERITA_EDIT" || modalMode === "AGENDA_EDIT" || modalMode === "ALBUM_FOTO";

  function getModalTitle() {
    switch (modalMode) {
      case "BERITA": return "Ajukan Berita Baru";
      case "BERITA_EDIT": return editStep === 1 ? "Pilih Berita yang Ingin Diedit" : `Edit Berita: ${selectedItem?.judul}`;
      case "AGENDA": return "Ajukan Agenda Baru";
      case "AGENDA_EDIT": return editStep === 1 ? "Pilih Agenda yang Ingin Diedit" : `Edit Agenda: ${selectedItem?.judul}`;
      case "ALBUM": return "Ajukan Album Baru";
      case "ALBUM_FOTO": return editStep === 1 ? "Pilih Album untuk Ditambah Foto" : `Tambah Foto ke: ${selectedItem?.judul}`;
      case "SETTINGS": return "Ajukan Perubahan Pengaturan";
      default: return "";
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Pengajuan Konten</h1>
          <p className="text-sm text-gray-500 mt-1">Ajukan konten untuk ditampilkan di situs. Admin akan mereview sebelum dipublikasikan.</p>
        </div>

        {/* New content */}
        <div className="mb-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Buat Konten Baru</p>
          <div className="flex flex-wrap gap-3">
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
        </div>

        {/* Edit existing content */}
        <div className="mb-8">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Modifikasi Konten yang Ada</p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => openModal("BERITA_EDIT")}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
            >
              ✏️ Edit Berita
            </button>
            <button
              onClick={() => openModal("AGENDA_EDIT")}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
            >
              ✏️ Edit Agenda
            </button>
            <button
              onClick={() => openModal("ALBUM_FOTO")}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
            >
              🖼️ Tambah Foto ke Album
            </button>
          </div>
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
                  {submissions.map((s) => {
                    let isEdit = false;
                    try { isEdit = !!JSON.parse(s.data).editTargetId; } catch { /* */ }
                    return (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                            {TYPE_LABELS[s.type]}
                          </span>
                          {isEdit && (
                            <span className="ml-1 inline-flex px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700">
                              Edit
                            </span>
                          )}
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
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                {isEditMode && editStep === 2 && (
                  <button
                    onClick={() => { setEditStep(1); setSelectedItem(null); setFormError(""); }}
                    className="text-gray-400 hover:text-gray-600 mr-1"
                    title="Kembali"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}
                <h3 className="font-semibold text-gray-900 text-sm leading-snug">{getModalTitle()}</h3>
              </div>
              <button onClick={() => setModalMode(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Step 1: Select existing item */}
            {isEditMode && editStep === 1 ? (
              <div className="px-6 py-5">
                {loadingItems ? (
                  <div className="flex justify-center py-8">
                    <div className="w-7 h-7 border-4 border-[#991B1B] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : existingItems.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">Belum ada data.</p>
                ) : (
                  <div className="space-y-2">
                    {existingItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => selectItemForEdit(item)}
                        className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:border-[#991B1B] hover:bg-red-50 transition group"
                      >
                        <p className="text-sm font-medium text-gray-800 group-hover:text-[#991B1B]">{item.judul}</p>
                        {item.ringkasan && <p className="text-xs text-gray-400 mt-0.5 truncate">{item.ringkasan}</p>}
                        {item.tanggal && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(item.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                            {item.lokasi ? ` · ${item.lokasi}` : ""}
                          </p>
                        )}
                        {item._count !== undefined && (
                          <p className="text-xs text-gray-400 mt-0.5">{item._count.fotos} foto</p>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* Step 2: Edit form (or regular new-content form) */
              <>
                <div className="px-6 py-5 space-y-4">
                  {formError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{formError}</div>
                  )}
                  {formSuccess && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">{formSuccess}</div>
                  )}

                  {/* Berita form (new or edit) */}
                  {(modalMode === "BERITA" || modalMode === "BERITA_EDIT") && (
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
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Gambar Cover</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleBeritaGambarChange}
                          className="block w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                        />
                        {uploadingBeritaGambar && <p className="text-xs text-gray-400 mt-1">Mengupload gambar...</p>}
                        {beritaForm.gambar && !uploadingBeritaGambar && (
                          <div className="mt-2 relative w-full h-36 rounded-lg overflow-hidden border border-gray-200">
                            <Image src={beritaForm.gambar} alt="Preview" fill className="object-cover" />
                            <button
                              type="button"
                              onClick={() => { setBeritaForm((p) => ({ ...p, gambar: "" })); setBeritaGambarFile(null); }}
                              className="absolute top-1.5 right-1.5 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-black/80"
                            >✕</button>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {/* Agenda form (new or edit) */}
                  {(modalMode === "AGENDA" || modalMode === "AGENDA_EDIT") && (
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

                  {/* Album new */}
                  {modalMode === "ALBUM" && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Judul <span className="text-red-500">*</span></label>
                        <input type="text" className={inputCls} value={albumForm.judul} onChange={(e) => setAlbumForm((p) => ({ ...p, judul: e.target.value }))} placeholder="Judul album" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Deskripsi</label>
                        <textarea rows={2} className={inputCls + " resize-none"} value={albumForm.deskripsi} onChange={(e) => setAlbumForm((p) => ({ ...p, deskripsi: e.target.value }))} placeholder="Deskripsi album" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Foto-foto</label>
                        <input
                          ref={albumFotoInputRef}
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleAlbumFotosChange}
                          className="block w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                        />
                        {uploadingAlbumFotos && <p className="text-xs text-gray-400 mt-1">Mengupload foto...</p>}
                        {albumFotos.length > 0 && (
                          <div className="mt-3 grid grid-cols-3 gap-2">
                            {albumFotos.map((url, i) => (
                              <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                                <Image src={url} alt={`Foto ${i + 1}`} fill className="object-cover" />
                                <button type="button" onClick={() => removeFoto(i)} className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-black/80">✕</button>
                              </div>
                            ))}
                          </div>
                        )}
                        {albumFotos.length > 0 && (
                          <p className="text-xs text-gray-400 mt-1">{albumFotos.length} foto dipilih. Klik + tambah lagi.</p>
                        )}
                      </div>
                    </>
                  )}

                  {/* Album add photos to existing */}
                  {modalMode === "ALBUM_FOTO" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Pilih foto yang ingin ditambahkan <span className="text-red-500">*</span>
                      </label>
                      <input
                        ref={albumFotoInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleAlbumFotosChange}
                        className="block w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                      />
                      {uploadingAlbumFotos && <p className="text-xs text-gray-400 mt-1">Mengupload foto...</p>}
                      {albumFotos.length > 0 && (
                        <div className="mt-3 grid grid-cols-3 gap-2">
                          {albumFotos.map((url, i) => (
                            <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                              <Image src={url} alt={`Foto ${i + 1}`} fill className="object-cover" />
                              <button type="button" onClick={() => removeFoto(i)} className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-black/80">✕</button>
                            </div>
                          ))}
                        </div>
                      )}
                      {albumFotos.length > 0 && (
                        <p className="text-xs text-gray-400 mt-1">{albumFotos.length} foto dipilih.</p>
                      )}
                    </div>
                  )}

                  {modalMode === "SETTINGS" && (
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
                    disabled={submitting || uploadingBeritaGambar || uploadingAlbumFotos}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#991B1B] text-white text-sm font-medium rounded-lg hover:bg-[#7F1D1D] disabled:opacity-60 transition"
                  >
                    {submitting && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                    {submitting ? "Mengirim..." : "Kirim Pengajuan"}
                  </button>
                  <button
                    onClick={() => setModalMode(null)}
                    className="px-5 py-2.5 border border-gray-200 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    Batal
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
