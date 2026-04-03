import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function BeritaDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let berita: Awaited<ReturnType<typeof prisma.berita.findUnique>> | null = null;
  let dbError = false;
  try {
    berita = await prisma.berita.findUnique({
      where: { slug, published: true },
    });
  } catch {
    dbError = true;
  }

  if (dbError) {
    return (
      <section className="py-32 bg-gray-50 text-center">
        <p className="text-gray-500 text-lg">Tidak dapat memuat berita.</p>
      </section>
    );
  }

  if (!berita) {
    notFound();
  }

  return (
    <>
      {/* Hero Banner */}
      <section className="bg-[#991B1B] py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/berita"
            className="inline-flex items-center gap-1 text-red-200 hover:text-white text-sm transition mb-4"
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
            Kembali ke Berita
          </Link>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight">
            {berita.judul}
          </h1>
          <div className="mt-4 flex items-center gap-3 text-red-200 text-sm">
            <span>{formatDate(berita.createdAt)}</span>
            <span>&middot;</span>
            <span>{berita.penulis}</span>
          </div>
        </div>
      </section>

      <article className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {berita.gambar && (
            <img
              src={berita.gambar}
              alt={berita.judul}
              className="w-full h-64 sm:h-96 object-cover rounded-xl mb-8"
            />
          )}

          <div
            className="prose prose-lg max-w-none text-gray-700"
            dangerouslySetInnerHTML={{ __html: berita.konten }}
          />

          <div className="mt-12 pt-8 border-t border-gray-200">
            <Link
              href="/berita"
              className="inline-flex items-center gap-2 text-[#991B1B] font-medium hover:underline"
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
              Kembali ke Daftar Berita
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}
