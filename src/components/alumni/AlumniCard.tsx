"use client";

interface AlumniCardProps {
  namaLengkap: string;
  tahunLulus: number;
  pekerjaan?: string;
  alamat?: string;
}

const avatarColors = [
  "bg-blue-600",
  "bg-indigo-600",
  "bg-violet-600",
  "bg-emerald-600",
  "bg-rose-600",
  "bg-amber-600",
  "bg-teal-600",
  "bg-cyan-600",
];

function getAvatarColor(initial: string): string {
  const index = initial.toUpperCase().charCodeAt(0) % avatarColors.length;
  return avatarColors[index];
}

export default function AlumniCard({
  namaLengkap,
  tahunLulus,
  pekerjaan,
  alamat,
}: AlumniCardProps) {
  const initial = namaLengkap.charAt(0).toUpperCase() || "A";
  const colorClass = getAvatarColor(initial);

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow duration-200 flex flex-col gap-3">
      {/* Avatar + Name */}
      <div className="flex items-center gap-3">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${colorClass}`}
        >
          <span className="text-white font-bold text-lg">{initial}</span>
        </div>
        <div className="min-w-0">
          <h3 className="font-bold text-gray-900 text-base leading-tight truncate">
            {namaLengkap}
          </h3>
          <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-[#991B1B]">
            Angkatan {tahunLulus}
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="flex flex-col gap-1.5 text-sm text-gray-600">
        {pekerjaan ? (
          <div className="flex items-start gap-2">
            {/* Briefcase icon */}
            <svg
              className="w-4 h-4 mt-0.5 shrink-0 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <span className="truncate">{pekerjaan}</span>
          </div>
        ) : (
          <div className="flex items-start gap-2 text-gray-400">
            <svg
              className="w-4 h-4 mt-0.5 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <span className="italic">Belum diisi</span>
          </div>
        )}

        {alamat && (
          <div className="flex items-start gap-2">
            {/* Pin icon */}
            <svg
              className="w-4 h-4 mt-0.5 shrink-0 text-gray-400"
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
            <span className="line-clamp-2">{alamat}</span>
          </div>
        )}
      </div>
    </div>
  );
}
