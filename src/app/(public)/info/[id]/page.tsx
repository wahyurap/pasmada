import Link from "next/link";
import { notFound } from "next/navigation";
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
    month: "long",
    year: "numeric",
  });
}

export default async function InfoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let item: {
    id: string;
    judul: string;
    kategori: string;
    ringkasan: string;
    konten: string;
    gambar: string | null;
    kontak: string | null;
    link: string | null;
    expiredAt: Date | null;
    published: boolean;
    createdAt: Date;
  } | null = null;

  try {
    item = await prisma.info.findUnique({ where: { id } });
  } catch {
    // db error
  }

  if (!item || !item.published) notFound();

  const isExpired = item.expiredAt && new Date(item.expiredAt) < new Date();

  return (
    <article className="bg-white min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link href="/info" className="text-sm text-[#991B1B] hover:underline">
          &larr; Kembali ke daftar info
        </Link>

        <div className="mt-4 flex items-center gap-2">
          <span
            className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
              KATEGORI_COLOR[item.kategori] || KATEGORI_COLOR.LAINNYA
            }`}
          >
            {KATEGORI_LABEL[item.kategori]}
          </span>
          {isExpired && (
            <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
              Kedaluwarsa
            </span>
          )}
        </div>

        <h1 className="mt-3 text-3xl sm:text-4xl font-bold text-gray-900">
          {item.judul}
        </h1>

        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
          <span>Diposting {formatDate(item.createdAt)}</span>
          {item.expiredAt && (
            <span className={isExpired ? "text-red-600" : "text-amber-600"}>
              Berlaku s/d {formatDate(item.expiredAt)}
            </span>
          )}
        </div>

        {item.gambar && (
          <div className="mt-6 rounded-2xl overflow-hidden shadow">
            <img
              src={item.gambar}
              alt={item.judul}
              className="w-full h-auto max-h-[500px] object-cover"
            />
          </div>
        )}

        <div className="mt-6 bg-red-50 border-l-4 border-[#991B1B] p-4 rounded-r-lg">
          <p className="text-gray-700 italic">{item.ringkasan}</p>
        </div>

        <div className="mt-8 prose prose-lg max-w-none text-gray-700 whitespace-pre-line leading-relaxed">
          {item.konten}
        </div>

        {(item.kontak || item.link) && (
          <div className="mt-8 p-5 bg-gray-50 rounded-xl border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-3">Kontak / Tautan</h3>
            <div className="space-y-2 text-sm">
              {item.kontak && (
                <p className="text-gray-700">
                  <span className="font-medium">Kontak:</span> {item.kontak}
                </p>
              )}
              {item.link && (
                <p className="text-gray-700">
                  <span className="font-medium">Tautan:</span>{" "}
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#991B1B] hover:underline break-all"
                  >
                    {item.link}
                  </a>
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
