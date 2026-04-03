import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function GaleriPage() {
  let albums: Awaited<ReturnType<typeof prisma.album.findMany<{
    include: { _count: { select: { fotos: true } }; fotos: { take: 1; orderBy: { createdAt: "asc" } } }
  }>>> = [];
  try {
    albums = await prisma.album.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { fotos: true } },
        fotos: { take: 1, orderBy: { createdAt: "asc" } },
      },
    });
  } catch {
    // DB unavailable
  }

  return (
    <>
      {/* Hero Banner */}
      <section className="ulos-hero relative py-16 overflow-hidden">
        <div className="absolute inset-0 batak-pattern" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            Galeri
          </h1>
          <p className="mt-3 text-red-200 text-lg">
            Dokumentasi kegiatan dan momen berharga PASMADA
          </p>
        </div>
        <div className="ulos-band mt-6" />
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {albums.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">
                Belum ada album foto yang tersedia.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {albums.map((album: typeof albums[number]) => (
                <Link
                  key={album.id}
                  href={`/galeri/${album.id}`}
                  className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition"
                >
                  {(() => {
                    const previewUrl = album.coverImage || album.fotos[0]?.url || null;
                    return previewUrl ? (
                      <img
                        src={previewUrl}
                        alt={album.judul}
                        className="w-full h-56 object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <div className="w-full h-56 bg-gradient-to-br from-red-100 to-red-50 flex items-center justify-center">
                        <svg
                          className="w-16 h-16 text-[#991B1B] opacity-30"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    );
                  })()}
                  <div className="p-5">
                    <h3 className="font-semibold text-gray-900 group-hover:text-[#991B1B] transition">
                      {album.judul}
                    </h3>
                    {album.deskripsi && (
                      <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                        {album.deskripsi}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-gray-500">
                      {album._count.fotos} foto
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
