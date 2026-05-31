import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const KATEGORI_LABEL: Record<string, string> = {
  LOKER: "Lowongan Kerja",
  USAHA: "Usaha Alumni",
  AGEN: "Agen",
  LAINNYA: "Lainnya",
};

const KATEGORI_COLOR: Record<string, string> = {
  LOKER: "bg-blue-100 text-blue-800",
  USAHA: "bg-green-100 text-green-800",
  AGEN: "bg-purple-100 text-purple-800",
  LAINNYA: "bg-gray-100 text-gray-800",
};

function formatDate(d: Date | string) {
  return new Date(d).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function InfoListPage({
  searchParams,
}: {
  searchParams: Promise<{ kategori?: string }>;
}) {
  const { kategori } = await searchParams;
  const filterKategori = kategori && KATEGORI_LABEL[kategori] ? kategori : null;

  let items: Array<{
    id: string;
    judul: string;
    kategori: string;
    ringkasan: string;
    gambar: string | null;
    expiredAt: Date | null;
    createdAt: Date;
  }> = [];

  try {
    items = await prisma.info.findMany({
      where: {
        published: true,
        ...(filterKategori && { kategori: filterKategori as "LOKER" | "USAHA" | "AGEN" | "LAINNYA" }),
        OR: [{ expiredAt: { gte: new Date() } }, { expiredAt: null }],
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        judul: true,
        kategori: true,
        ringkasan: true,
        gambar: true,
        expiredAt: true,
        createdAt: true,
      },
    });
  } catch {
    // db error
  }

  return (
    <>
      <section className="ulos-hero relative py-16 overflow-hidden">
        <div className="absolute inset-0 batak-pattern" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Info</h1>
          <p className="mt-3 text-red-200 text-lg max-w-2xl mx-auto">
            Lowongan kerja, promosi usaha alumni, dan info penting lainnya
          </p>
        </div>
        <div className="ulos-band mt-6" />
      </section>

      <section className="py-10 bg-gray-50 min-h-[40vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filter chips */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Link
              href="/info"
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                !filterKategori
                  ? "bg-[#991B1B] text-white"
                  : "bg-white text-gray-700 border border-gray-200 hover:border-[#991B1B]"
              }`}
            >
              Semua
            </Link>
            {Object.entries(KATEGORI_LABEL).map(([key, label]) => (
              <Link
                key={key}
                href={`/info?kategori=${key}`}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                  filterKategori === key
                    ? "bg-[#991B1B] text-white"
                    : "bg-white text-gray-700 border border-gray-200 hover:border-[#991B1B]"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          {items.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl">
              <p className="text-gray-500">Belum ada info yang ditampilkan.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <Link
                  key={item.id}
                  href={`/info/${item.id}`}
                  className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition flex flex-col"
                >
                  {item.gambar ? (
                    <img
                      src={item.gambar}
                      alt={item.judul}
                      className="w-full h-44 object-cover group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <div className="w-full h-44 bg-gradient-to-br from-red-50 to-amber-50 flex items-center justify-center">
                      <span className="text-4xl text-[#991B1B]/20 font-bold">i</span>
                    </div>
                  )}
                  <div className="p-5 flex-1 flex flex-col">
                    <span
                      className={`inline-flex self-start px-2 py-0.5 rounded text-xs font-medium ${
                        KATEGORI_COLOR[item.kategori] || KATEGORI_COLOR.LAINNYA
                      }`}
                    >
                      {KATEGORI_LABEL[item.kategori]}
                    </span>
                    <h3 className="mt-2 font-semibold text-gray-900 group-hover:text-[#991B1B] line-clamp-2">
                      {item.judul}
                    </h3>
                    <p className="mt-2 text-sm text-gray-600 line-clamp-3 flex-1">
                      {item.ringkasan}
                    </p>
                    <p className="mt-3 text-xs text-gray-400">
                      {formatDate(item.createdAt)}
                      {item.expiredAt && (
                        <span className="ml-2 text-amber-600">
                          &middot; Berlaku s/d {formatDate(item.expiredAt)}
                        </span>
                      )}
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
