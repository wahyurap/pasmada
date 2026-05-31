"use client";

import { useEffect, useState } from "react";

interface OrgMember { jabatan: string; nama: string; foto?: string }

interface Settings {
  namaOrganisasi: string;
  deskripsi: string;
  sambutanKetua: string;
  alamat: string;
  email: string;
  telepon: string;
  facebook: string;
  instagram: string;
  youtube: string;
  sejarah: string;
  visi: string;
  misi: string;
  strukturOrganisasi: OrgMember[];
}

const empty: Settings = {
  namaOrganisasi: "",
  deskripsi: "",
  sambutanKetua: "",
  alamat: "",
  email: "",
  telepon: "",
  facebook: "",
  instagram: "",
  youtube: "",
  sejarah: "",
  visi: "",
  misi: "",
  strukturOrganisasi: [
    { jabatan: "Ketua Umum", nama: "", foto: "" },
    { jabatan: "Wakil Ketua", nama: "", foto: "" },
    { jabatan: "Sekretaris", nama: "", foto: "" },
    { jabatan: "Bendahara", nama: "", foto: "" },
    { jabatan: "Humas", nama: "", foto: "" },
    { jabatan: "Koordinator Wilayah", nama: "", foto: "" },
  ],
};

async function uploadPengurusFoto(file: File): Promise<string | null> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("subdir", "pengurus");
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  if (!res.ok) return null;
  const data = await res.json();
  return (data.url as string) || null;
}

export default function AdminSettingsPage() {
  const [form, setForm] = useState<Settings>(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        let struktur = empty.strukturOrganisasi;
        try { struktur = JSON.parse(data.strukturOrganisasi || "[]"); } catch {}
        if (!struktur.length) struktur = empty.strukturOrganisasi;
        setForm({
          namaOrganisasi: data.namaOrganisasi || "",
          deskripsi: data.deskripsi || "",
          sambutanKetua: data.sambutanKetua || "",
          alamat: data.alamat || "",
          email: data.email || "",
          telepon: data.telepon || "",
          facebook: data.facebook || "",
          instagram: data.instagram || "",
          youtube: data.youtube || "",
          sejarah: data.sejarah || "",
          visi: data.visi || "",
          misi: data.misi || "",
          strukturOrganisasi: struktur,
        });
      })
      .catch(() => setErrorMsg("Gagal memuat pengaturan"))
      .finally(() => setLoading(false));
  }, []);

  function set(key: keyof Settings) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          strukturOrganisasi: JSON.stringify(form.strukturOrganisasi),
        }),
      });
      if (res.ok) {
        setSuccessMsg("Pengaturan berhasil disimpan");
        setTimeout(() => setSuccessMsg(""), 3000);
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Gagal menyimpan pengaturan");
      }
    } catch {
      setErrorMsg("Terjadi kesalahan jaringan");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#991B1B]" />
      </div>
    );
  }

  const inputClass =
    "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#991B1B]/30";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Pengaturan Situs</h2>
        <p className="text-gray-500 mt-1 text-sm">Kelola informasi dan konten utama PASMADA</p>
      </div>

      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Informasi Organisasi */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h3 className="font-semibold text-gray-900 border-b border-gray-100 pb-3">
            Informasi Organisasi
          </h3>
          <div>
            <label className={labelClass}>Nama Organisasi</label>
            <input type="text" value={form.namaOrganisasi} onChange={set("namaOrganisasi")} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Deskripsi Singkat</label>
            <textarea value={form.deskripsi} onChange={set("deskripsi")} rows={2} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Sambutan Ketua</label>
            <textarea value={form.sambutanKetua} onChange={set("sambutanKetua")} rows={6} placeholder="Tulis sambutan ketua di sini..." className={inputClass} />
          </div>
        </div>

        {/* Kontak */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h3 className="font-semibold text-gray-900 border-b border-gray-100 pb-3">
            Informasi Kontak
          </h3>
          <div>
            <label className={labelClass}>Alamat</label>
            <input type="text" value={form.alamat} onChange={set("alamat")} placeholder="Alamat lengkap" className={inputClass} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Email</label>
              <input type="email" value={form.email} onChange={set("email")} placeholder="info@pasmada.org" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Telepon / WhatsApp</label>
              <input type="text" value={form.telepon} onChange={set("telepon")} placeholder="+62 812 xxxx xxxx" className={inputClass} />
            </div>
          </div>
        </div>

        {/* Media Sosial */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h3 className="font-semibold text-gray-900 border-b border-gray-100 pb-3">
            Media Sosial
          </h3>
          <div>
            <label className={labelClass}>Facebook (URL)</label>
            <input type="url" value={form.facebook} onChange={set("facebook")} placeholder="https://facebook.com/pasmada" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Instagram (URL)</label>
            <input type="url" value={form.instagram} onChange={set("instagram")} placeholder="https://instagram.com/pasmada" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>YouTube (URL)</label>
            <input type="url" value={form.youtube} onChange={set("youtube")} placeholder="https://youtube.com/@pasmada" className={inputClass} />
          </div>
        </div>

        {/* Halaman Tentang */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h3 className="font-semibold text-gray-900 border-b border-gray-100 pb-3">
            Halaman Tentang
          </h3>
          <div>
            <label className={labelClass}>Sejarah</label>
            <textarea value={form.sejarah} onChange={set("sejarah")} rows={6} placeholder="Tulis sejarah organisasi..." className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Visi</label>
            <textarea value={form.visi} onChange={set("visi")} rows={3} placeholder="Tulis visi organisasi..." className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>
              Misi <span className="text-gray-400 font-normal">(satu poin per baris)</span>
            </label>
            <textarea value={form.misi} onChange={set("misi")} rows={5} placeholder={"Mempererat tali silaturahmi antar alumni\nMendukung pengembangan SMAN 1 Panyabungan\n..."} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Struktur Organisasi</label>
            <div className="space-y-2">
              {form.strukturOrganisasi.map((item, i) => (
                <div key={i} className="flex gap-2 items-start p-3 bg-gray-50 rounded-lg">
                  {/* Foto preview + upload */}
                  <div className="flex-shrink-0">
                    <label className="cursor-pointer block">
                      {item.foto ? (
                        <img
                          src={item.foto}
                          alt={item.nama || "Foto pengurus"}
                          className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm hover:opacity-80 transition"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-white border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-[#991B1B] transition">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const url = await uploadPengurusFoto(file);
                          if (url) {
                            const s = [...form.strukturOrganisasi];
                            s[i] = { ...s[i], foto: url };
                            setForm((p) => ({ ...p, strukturOrganisasi: s }));
                          } else {
                            setErrorMsg("Gagal upload foto pengurus");
                          }
                          e.target.value = "";
                        }}
                      />
                    </label>
                  </div>

                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={item.jabatan}
                      onChange={(e) => {
                        const s = [...form.strukturOrganisasi];
                        s[i] = { ...s[i], jabatan: e.target.value };
                        setForm((p) => ({ ...p, strukturOrganisasi: s }));
                      }}
                      placeholder="Jabatan"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#991B1B]/30"
                    />
                    <input
                      type="text"
                      value={item.nama}
                      onChange={(e) => {
                        const s = [...form.strukturOrganisasi];
                        s[i] = { ...s[i], nama: e.target.value };
                        setForm((p) => ({ ...p, strukturOrganisasi: s }));
                      }}
                      placeholder="Nama"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#991B1B]/30"
                    />
                    {item.foto && (
                      <button
                        type="button"
                        onClick={() => {
                          const s = [...form.strukturOrganisasi];
                          s[i] = { ...s[i], foto: "" };
                          setForm((p) => ({ ...p, strukturOrganisasi: s }));
                        }}
                        className="text-xs text-gray-500 hover:text-red-600 transition"
                      >
                        Hapus foto
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, strukturOrganisasi: p.strukturOrganisasi.filter((_, j) => j !== i) }))}
                    className="p-2 text-red-400 hover:text-red-600 transition flex-shrink-0"
                    aria-label="Hapus anggota"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setForm((p) => ({ ...p, strukturOrganisasi: [...p.strukturOrganisasi, { jabatan: "", nama: "", foto: "" }] }))}
                className="mt-1 text-sm text-[#991B1B] hover:underline"
              >
                + Tambah anggota
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 text-sm font-medium text-white bg-[#991B1B] rounded-lg hover:bg-[#7F1D1D] disabled:opacity-50 transition"
          >
            {saving ? "Menyimpan..." : "Simpan Pengaturan"}
          </button>
        </div>
      </form>
    </div>
  );
}
