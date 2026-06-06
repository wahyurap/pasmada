import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const PER_PAGE = 9;

const KATEGORI_LABEL: Record<string, string> = {
  BERITA: "Berita",
  ARTIKEL: "Artikel",
  OPINI: "Opini",
  CERPEN: "Cerpen",
};

const KATEGORI_COLOR: Record<string, string> = {
  BERITA: "bg-blue-100 text-blue-800",
  ARTIKEL: "bg-emerald-100 text-emerald-800",
  OPINI: "bg-amber-100 text-amber-800",
  CERPEN: "bg-purple-100 text-purple-800",
};

const KATEGORI_KEYS = ["BERITA", "ARTIKEL", "OPINI", "CERPEN"] as const;
type Kategori = typeof KATEGORI_KEYS[number];

function isKategori(s: string | undefined): s is Kategori {
  return !!s && (KATEGORI_KEYS as readonly string[]).includes(s);
}

export default async function KolomPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const pageParam = Array.isArray(params.page) ? params.page[0] : params.page;
  const kategoriParam = Array.isArray(params.kategori) ? params.kategori[0] : params.kategori;
  const currentPage = Math.max(1, Number(pageParam) || 1);
  const filterKategori: Kategori | null = isKategori(kategoriParam) ? kategoriParam : null;

  let beritaList: Awaited<ReturnType<typeof prisma.berita.findMany>> = [];
  let totalCount = 0;
  let totalPages = 0;
  try {
    const where = {
      published: true,
      ...(filterKategori && { kategori: filterKategori }),
    };
    [beritaList, totalCount] = await Promise.all([
      prisma.berita.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (currentPage - 1) * PER_PAGE,
        take: PER_PAGE,
      }),
      prisma.berita.count({ where }),
    ]);
    totalPages = Math.ceil(totalCount / PER_PAGE);
  } catch {
    // DB unavailable
  }

  const buildHref = (page: number, kat: Kategori | null) => {
    const sp = new URLSearchParams();
    if (page > 1) sp.set("page", String(page));
    if (kat) sp.set("kategori", kat);
    const qs = sp.toString();
    return `/berita${qs ? `?${qs}` : ""}`;
  };

  return (
    <>
      {/* Hero Banner */}
      <section className="ulos-hero relative py-16 overflow-hidden">
        <div className="absolute inset-0 batak-pattern" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            Kolom
          </h1>
          <p className="mt-3 text-red-200 text-lg">
            Berita &middot; Artikel &middot; Opini &middot; Cerpen
          </p>
        </div>
        <div className="ulos-band mt-6" />
      </section>

      <section className="py-10 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filter chips */}
          <div className="flex flex-wrap gap-2 mb-6 justify-center">
            <Link
              href={buildHref(1, null)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                !filterKategori
                  ? "bg-[#991B1B] text-white"
                  : "bg-white text-gray-700 border border-gray-200 hover:border-[#991B1B]"
              }`}
            >
              Semua
            </Link>
            {KATEGORI_KEYS.map((k) => (
              <Link
                key={k}
                href={buildHref(1, k)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                  filterKategori === k
                    ? "bg-[#991B1B] text-white"
                    : "bg-white text-gray-700 border border-gray-200 hover:border-[#991B1B]"
                }`}
              >
                {KATEGORI_LABEL[k]}
              </Link>
            ))}
          </div>

          {beritaList.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">
                {filterKategori
                  ? `Belum ada ${KATEGORI_LABEL[filterKategori].toLowerCase()} yang dipublikasikan.`
                  : "Belum ada tulisan yang dipublikasikan."}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {beritaList.map((berita: typeof beritaList[number]) => (
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
                      <div className="w-full h-48 bg-gradient-to-br from-red-100 to-red-50 flex items-center justify-center">
                        <span className="text-[#991B1B] text-4xl font-bold opacity-30">
                          P
                        </span>
                      </div>
                    )}
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                            KATEGORI_COLOR[berita.kategori] || KATEGORI_COLOR.BERITA
                          }`}
                        >
                          {KATEGORI_LABEL[berita.kategori] || "Berita"}
                        </span>
                        <p className="text-xs text-gray-500">
                          {formatDate(berita.createdAt)} &middot; {berita.penulis}
                        </p>
                      </div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-[#991B1B] transition line-clamp-2">
                        {berita.judul}
                      </h3>
                      {berita.ringkasan && (
                        <p className="mt-2 text-sm text-gray-600 line-clamp-3">
                          {berita.ringkasan}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-2">
                  {currentPage > 1 && (
                    <Link
                      href={buildHref(currentPage - 1, filterKategori)}
                      className="px-4 py-2 text-sm font-medium text-[#991B1B] bg-white border border-gray-200 rounded-lg hover:bg-red-50 transition"
                    >
                      &larr; Sebelumnya
                    </Link>
                  )}

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <Link
                        key={page}
                        href={buildHref(page, filterKategori)}
                        className={`w-10 h-10 flex items-center justify-center text-sm font-medium rounded-lg transition ${
                          page === currentPage
                            ? "bg-[#991B1B] text-white"
                            : "bg-white text-gray-700 border border-gray-200 hover:bg-red-50"
                        }`}
                      >
                        {page}
                      </Link>
                    )
                  )}

                  {currentPage < totalPages && (
                    <Link
                      href={buildHref(currentPage + 1, filterKategori)}
                      className="px-4 py-2 text-sm font-medium text-[#991B1B] bg-white border border-gray-200 rounded-lg hover:bg-red-50 transition"
                    >
                      Selanjutnya &rarr;
                    </Link>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}
