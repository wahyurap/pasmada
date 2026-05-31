import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ProfilAlumniDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let item: {
    id: string;
    nama: string;
    tahunLulus: number;
    pekerjaan: string;
    foto: string | null;
    ringkasan: string;
    kisah: string;
    published: boolean;
  } | null = null;

  try {
    item = await prisma.alumniPilihan.findUnique({ where: { id } });
  } catch {
    // db error
  }

  if (!item || !item.published) notFound();

  return (
    <article className="bg-white">
      <header className="ulos-hero relative py-16 overflow-hidden">
        <div className="absolute inset-0 batak-pattern" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/profil-alumni"
            className="inline-flex items-center gap-1 text-red-200 hover:text-white text-sm mb-4"
          >
            &larr; Kembali ke daftar
          </Link>
          <p className="text-[#D97706] text-xs font-semibold uppercase tracking-wider">
            Profil Alumni Pilihan &middot; Angkatan {item.tahunLulus}
          </p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-white">
            {item.nama}
          </h1>
          <p className="mt-2 text-red-100 text-lg">{item.pekerjaan}</p>
        </div>
        <div className="ulos-band mt-6" />
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {item.foto && (
          <div className="mb-8 rounded-2xl overflow-hidden shadow-lg">
            <img
              src={item.foto}
              alt={item.nama}
              className="w-full h-auto max-h-[500px] object-cover"
            />
          </div>
        )}

        <div className="bg-red-50 border-l-4 border-[#991B1B] p-6 rounded-r-xl mb-8">
          <p className="text-gray-700 italic leading-relaxed">
            {item.ringkasan}
          </p>
        </div>

        <div className="prose prose-lg max-w-none text-gray-700 whitespace-pre-line leading-relaxed">
          {item.kisah}
        </div>
      </div>
    </article>
  );
}
