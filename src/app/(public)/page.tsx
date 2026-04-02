import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export default async function HomePage() {
  let settings = null, alumniCount = 0, angkatanCount = 0, beritaCount = 0, agendaCount = 0;
  let beritaTerbaru: Array<{ id: string; slug: string; judul: string; ringkasan: string | null; gambar: string | null; createdAt: Date }> = [];
  let agendaMendatang: Array<{ id: string; judul: string; tanggal: Date; lokasi: string; deskripsi: string }> = [];

  try {
    [settings, alumniCount, angkatanCount, beritaCount, agendaCount, beritaTerbaru, agendaMendatang] =
      await Promise.all([
        prisma.siteSettings.findFirst({ where: { id: "default" } }),
        prisma.alumni.count(),
        prisma.alumni
          .groupBy({ by: ["tahunLulus"] })
          .then((g: unknown[]) => g.length),
        prisma.berita.count({ where: { published: true } }),
        prisma.agenda.count(),
        prisma.berita.findMany({
          where: { published: true },
          orderBy: { createdAt: "desc" },
          take: 3,
        }),
        prisma.agenda.findMany({
          where: { tanggal: { gte: new Date() } },
          orderBy: { tanggal: "asc" },
          take: 3,
        }),
      ]);
  } catch {
    // Database not available - show page with empty data
  }

  const stats = [
    { label: "Alumni Terdaftar", value: alumniCount },
    { label: "Angkatan", value: angkatanCount },
    { label: "Berita", value: beritaCount },
    { label: "Kegiatan", value: agendaCount },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-[#1e40af] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1e40af] via-[#1e3a8a] to-[#0f1d4a]" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight">
            PASMADA
          </h1>
          <p className="mt-4 text-xl sm:text-2xl text-blue-200 font-medium">
            Parsadaan Alumni SMAN Sada
          </p>
          <p className="mt-4 text-lg text-blue-100 max-w-2xl mx-auto">
            Wadah silaturahmi dan komunikasi antar alumni SMAN 1 Panyabungan,
            Mandailing Natal, Sumatera Utara untuk mempererat tali persaudaraan
            dan berkontribusi bagi almamater.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/alumni"
              className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-[#1e40af] bg-white rounded-lg hover:bg-blue-50 transition"
            >
              Cari Alumni
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-white border-2 border-white rounded-lg hover:bg-white/10 transition"
            >
              Daftar Sekarang
            </Link>
          </div>
        </div>
      </section>

      {/* Sambutan Ketua */}
      {settings?.sambutanKetua && (
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-2">
              Sambutan Ketua
            </h2>
            <div className="w-16 h-1 bg-[#1e40af] mx-auto mb-8 rounded-full" />
            <div className="bg-blue-50 rounded-2xl p-8 border border-blue-100">
              <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
                {settings.sambutanKetua}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100"
              >
                <div className="text-3xl sm:text-4xl font-extrabold text-[#1e40af]">
                  {stat.value}
                </div>
                <div className="mt-2 text-sm text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Berita Terbaru */}
      {beritaTerbaru.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">
                  Berita Terbaru
                </h2>
                <div className="w-16 h-1 bg-[#1e40af] mt-2 rounded-full" />
              </div>
              <Link
                href="/berita"
                className="text-[#1e40af] font-medium hover:underline text-sm"
              >
                Lihat Semua &rarr;
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {beritaTerbaru.map((berita: typeof beritaTerbaru[number]) => (
                <Link
                  key={berita.id}
                  href={`/berita/${berita.slug}`}
                  className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition"
                >
                  {berita.gambar ? (
                    <img
                      src={berita.gambar}
                      alt={berita.judul}
                      className="w-full h-48 object-cover group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                      <span className="text-[#1e40af] text-4xl font-bold opacity-30">
                        P
                      </span>
                    </div>
                  )}
                  <div className="p-5">
                    <p className="text-xs text-gray-500 mb-2">
                      {formatDate(berita.createdAt)}
                    </p>
                    <h3 className="font-semibold text-gray-900 group-hover:text-[#1e40af] transition line-clamp-2">
                      {berita.judul}
                    </h3>
                    {berita.ringkasan && (
                      <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                        {berita.ringkasan}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Agenda Mendatang */}
      {agendaMendatang.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">
                  Agenda Mendatang
                </h2>
                <div className="w-16 h-1 bg-[#1e40af] mt-2 rounded-full" />
              </div>
              <Link
                href="/agenda"
                className="text-[#1e40af] font-medium hover:underline text-sm"
              >
                Lihat Semua &rarr;
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {agendaMendatang.map((agenda: typeof agendaMendatang[number]) => (
                <div
                  key={agenda.id}
                  className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-md transition"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-14 h-14 bg-[#1e40af] rounded-lg flex flex-col items-center justify-center text-white">
                      <span className="text-lg font-bold leading-none">
                        {new Date(agenda.tanggal).getDate()}
                      </span>
                      <span className="text-xs mt-0.5">
                        {new Date(agenda.tanggal).toLocaleDateString("id-ID", {
                          month: "short",
                        })}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 line-clamp-2">
                        {agenda.judul}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500 flex items-center gap-1">
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        {agenda.lokasi}
                      </p>
                      <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                        {agenda.deskripsi}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
