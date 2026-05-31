import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ProfilAlumniPage() {
  let items: Array<{
    id: string;
    nama: string;
    tahunLulus: number;
    pekerjaan: string;
    foto: string | null;
    ringkasan: string;
  }> = [];

  try {
    items = await prisma.alumniPilihan.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        nama: true,
        tahunLulus: true,
        pekerjaan: true,
        foto: true,
        ringkasan: true,
      },
    });
  } catch {
    // empty
  }

  return (
    <>
      <section className="ulos-hero relative py-16 overflow-hidden">
        <div className="absolute inset-0 batak-pattern" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            Profil Alumni Pilihan
          </h1>
          <p className="mt-3 text-red-200 text-lg max-w-2xl mx-auto">
            Kisah perjalanan alumni SMAN 1 Panyabungan yang menginspirasi
          </p>
        </div>
        <div className="ulos-band mt-6" />
      </section>

      <section className="py-16 bg-gray-50 min-h-[40vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                Belum ada profil alumni yang ditampilkan.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <Link
                  key={item.id}
                  href={`/profil-alumni/${item.id}`}
                  className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition"
                >
                  <div className="aspect-[4/3] bg-gradient-to-br from-red-50 to-amber-50 relative overflow-hidden">
                    {item.foto ? (
                      <img
                        src={item.foto}
                        alt={item.nama}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <span className="text-6xl font-bold text-[#991B1B]/20">
                          {item.nama[0]}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <p className="text-xs text-[#D97706] font-semibold uppercase tracking-wider">
                      Angkatan {item.tahunLulus}
                    </p>
                    <h3 className="mt-1 text-lg font-bold text-gray-900 group-hover:text-[#991B1B] transition">
                      {item.nama}
                    </h3>
                    <p className="mt-0.5 text-sm text-gray-600">
                      {item.pekerjaan}
                    </p>
                    <p className="mt-3 text-sm text-gray-500 line-clamp-3">
                      {item.ringkasan}
                    </p>
                    <p className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[#991B1B] group-hover:underline">
                      Baca kisah lengkap &rarr;
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
