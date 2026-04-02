import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";

const PER_PAGE = 9;

export default async function BeritaPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { page: pageParam } = await searchParams;
  const currentPage = Math.max(1, Number(pageParam) || 1);

  let beritaList: Awaited<ReturnType<typeof prisma.berita.findMany>> = [];
  let totalCount = 0;
  let totalPages = 0;
  try {
    [beritaList, totalCount] = await Promise.all([
      prisma.berita.findMany({
        where: { published: true },
        orderBy: { createdAt: "desc" },
        skip: (currentPage - 1) * PER_PAGE,
        take: PER_PAGE,
      }),
      prisma.berita.count({ where: { published: true } }),
    ]);
    totalPages = Math.ceil(totalCount / PER_PAGE);
  } catch {
    // DB unavailable
  }

  return (
    <>
      {/* Hero Banner */}
      <section className="relative bg-[#991B1B] py-16 overflow-hidden">
        <div className="absolute inset-0 batak-pattern" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            Berita
          </h1>
          <p className="mt-3 text-red-200 text-lg">
            Informasi dan kabar terbaru seputar PASMADA
          </p>
        </div>
        <div className="batak-divider mt-6" />
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {beritaList.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">
                Belum ada berita yang dipublikasikan.
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
                      <p className="text-xs text-gray-500 mb-2">
                        {formatDate(berita.createdAt)} &middot; {berita.penulis}
                      </p>
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
                      href={`/berita?page=${currentPage - 1}`}
                      className="px-4 py-2 text-sm font-medium text-[#991B1B] bg-white border border-gray-200 rounded-lg hover:bg-red-50 transition"
                    >
                      &larr; Sebelumnya
                    </Link>
                  )}

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <Link
                        key={page}
                        href={`/berita?page=${page}`}
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
                      href={`/berita?page=${currentPage + 1}`}
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
