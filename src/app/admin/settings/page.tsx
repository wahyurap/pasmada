"use client";

import { useEffect, useState } from "react";

interface OrgMember { jabatan: string; nama: string }

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
    { jabatan: "Ketua Umum", nama: "" },
    { jabatan: "Wakil Ketua", nama: "" },
    { jabatan: "Sekretaris", nama: "" },
    { jabatan: "Bendahara", nama: "" },
    { jabatan: "Humas", nama: "" },
    { jabatan: "Koordinator Wilayah", nama: "" },
  ],
};

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
                <div key={i} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={item.jabatan}
                    onChange={(e) => {
                      const s = [...form.strukturOrganisasi];
                      s[i] = { ...s[i], jabatan: e.target.value };
                      setForm((p) => ({ ...p, strukturOrganisasi: s }));
                    }}
                    placeholder="Jabatan"
                    className="w-1/2 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#991B1B]/30"
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
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#991B1B]/30"
                  />
                  <button
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, strukturOrganisasi: p.strukturOrganisasi.filter((_, j) => j !== i) }))}
                    className="p-2 text-red-400 hover:text-red-600 transition"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setForm((p) => ({ ...p, strukturOrganisasi: [...p.strukturOrganisasi, { jabatan: "", nama: "" }] }))}
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
