import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";

export default async function AlbumDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  type AlbumWithFotos = {
    id: string;
    judul: string;
    deskripsi: string | null;
    coverImage: string | null;
    createdAt: Date;
    updatedAt: Date;
    fotos: Array<{ id: string; url: string; caption: string | null; createdAt: Date }>;
  };
  let album: AlbumWithFotos | null = null;
  let dbError = false;
  try {
    album = await prisma.album.findUnique({
      where: { id },
      include: {
        fotos: {
          orderBy: { createdAt: "desc" },
        },
      },
    }) as AlbumWithFotos | null;
  } catch {
    dbError = true;
  }

  if (dbError) {
    return (
      <section className="py-32 bg-gray-50 text-center">
        <p className="text-gray-500 text-lg">Tidak dapat memuat galeri.</p>
      </section>
    );
  }

  if (!album) {
    notFound();
  }

  return (
    <>
      {/* Hero Banner */}
      <section className="bg-[#1e40af] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/galeri"
            className="inline-flex items-center gap-1 text-blue-200 hover:text-white text-sm transition mb-4"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Kembali ke Galeri
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {album.judul}
          </h1>
          {album.deskripsi && (
            <p className="mt-2 text-blue-200">{album.deskripsi}</p>
          )}
          <p className="mt-2 text-sm text-blue-300">
            {album.fotos.length} foto
          </p>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {album.fotos.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">
                Belum ada foto dalam album ini.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {album.fotos.map((foto: typeof album.fotos[number]) => (
                <div
                  key={foto.id}
                  className="group relative bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition"
                >
                  <img
                    src={foto.url}
                    alt={foto.caption || album.judul}
                    className="w-full h-56 object-cover group-hover:scale-105 transition duration-300"
                  />
                  {foto.caption && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                      <p className="text-sm text-white">{foto.caption}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
