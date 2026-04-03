import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AgendaPage() {
  const now = new Date();

  let agendaMendatang: Awaited<ReturnType<typeof prisma.agenda.findMany>> = [];
  let agendaSebelumnya: Awaited<ReturnType<typeof prisma.agenda.findMany>> = [];
  try {
    [agendaMendatang, agendaSebelumnya] = await Promise.all([
      prisma.agenda.findMany({
        where: { tanggal: { gte: now } },
        orderBy: { tanggal: "asc" },
      }),
      prisma.agenda.findMany({
        where: { tanggal: { lt: now } },
        orderBy: { tanggal: "desc" },
        take: 12,
      }),
    ]);
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
            Agenda
          </h1>
          <p className="mt-3 text-red-200 text-lg">
            Jadwal kegiatan dan acara PASMADA
          </p>
        </div>
        <div className="batak-divider mt-6" />
      </section>

      {/* Agenda Mendatang */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Agenda Mendatang
          </h2>
          <div className="w-16 h-1 bg-[#991B1B] mb-8 rounded-full" />

          {agendaMendatang.length === 0 ? (
            <p className="text-gray-500 py-8 text-center">
              Belum ada agenda mendatang saat ini.
            </p>
          ) : (
            <div className="space-y-4">
              {agendaMendatang.map((agenda: typeof agendaMendatang[number]) => (
                <div
                  key={agenda.id}
                  className="flex items-start gap-4 p-6 bg-red-50 rounded-xl border border-red-100"
                >
                  <div className="flex-shrink-0 w-16 h-16 bg-[#991B1B] rounded-lg flex flex-col items-center justify-center text-white">
                    <span className="text-xl font-bold leading-none">
                      {new Date(agenda.tanggal).getDate()}
                    </span>
                    <span className="text-xs mt-0.5">
                      {new Date(agenda.tanggal).toLocaleDateString("id-ID", {
                        month: "short",
                      })}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {agenda.judul}
                    </h3>
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
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
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        {formatDate(agenda.tanggal)}
                      </span>
                      <span className="flex items-center gap-1">
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
                      </span>
                    </div>
                    <p className="mt-3 text-gray-700 leading-relaxed">
                      {agenda.deskripsi}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Agenda Sebelumnya */}
      {agendaSebelumnya.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Agenda Sebelumnya
            </h2>
            <div className="w-16 h-1 bg-[#991B1B] mb-8 rounded-full" />

            <div className="space-y-4">
              {agendaSebelumnya.map((agenda: typeof agendaSebelumnya[number]) => (
                <div
                  key={agenda.id}
                  className="flex items-start gap-4 p-6 bg-white rounded-xl border border-gray-100"
                >
                  <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-lg flex flex-col items-center justify-center text-gray-600">
                    <span className="text-xl font-bold leading-none">
                      {new Date(agenda.tanggal).getDate()}
                    </span>
                    <span className="text-xs mt-0.5">
                      {new Date(agenda.tanggal).toLocaleDateString("id-ID", {
                        month: "short",
                      })}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-700">
                      {agenda.judul}
                    </h3>
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
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
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        {formatDate(agenda.tanggal)}
                      </span>
                      <span className="flex items-center gap-1">
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
                      </span>
                    </div>
                    <p className="mt-3 text-gray-600 leading-relaxed">
                      {agenda.deskripsi}
                    </p>
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
