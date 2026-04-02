import { prisma } from "@/lib/db";

export default async function KontakPage() {
  let settings: Awaited<ReturnType<typeof prisma.siteSettings.findFirst>> | null = null;
  try {
    settings = await prisma.siteSettings.findFirst({
      where: { id: "default" },
    });
  } catch {
    // DB unavailable — page shows with null settings (contact info hidden)
  }

  return (
    <>
      {/* Hero Banner */}
      <section className="relative bg-[#991B1B] py-16 overflow-hidden">
        <div className="absolute inset-0 batak-pattern" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            Kontak
          </h1>
          <p className="mt-3 text-red-200 text-lg">
            Hubungi kami untuk informasi lebih lanjut
          </p>
        </div>
        <div className="batak-divider mt-6" />
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Info & Map */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Informasi Kontak
              </h2>
              <div className="w-16 h-1 bg-[#991B1B] mb-8 rounded-full" />

              <div className="space-y-6">
                {settings?.alamat && (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#991B1B]/10 rounded-lg flex items-center justify-center shrink-0">
                      <svg
                        className="w-5 h-5 text-[#991B1B]"
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
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Alamat</h3>
                      <p className="text-gray-600 mt-1">{settings.alamat}</p>
                    </div>
                  </div>
                )}

                {settings?.email && (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#991B1B]/10 rounded-lg flex items-center justify-center shrink-0">
                      <svg
                        className="w-5 h-5 text-[#991B1B]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Email</h3>
                      <p className="text-gray-600 mt-1">{settings.email}</p>
                    </div>
                  </div>
                )}

                {settings?.telepon && (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#991B1B]/10 rounded-lg flex items-center justify-center shrink-0">
                      <svg
                        className="w-5 h-5 text-[#991B1B]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Telepon</h3>
                      <p className="text-gray-600 mt-1">{settings.telepon}</p>
                    </div>
                  </div>
                )}

                {(settings?.facebook || settings?.instagram || settings?.youtube) && (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#991B1B]/10 rounded-lg flex items-center justify-center shrink-0">
                      <svg
                        className="w-5 h-5 text-[#991B1B]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Media Sosial
                      </h3>
                      <div className="mt-2 flex gap-3">
                        {settings.facebook && (
                          <a
                            href={settings.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-500 hover:text-[#991B1B] transition"
                          >
                            Facebook
                          </a>
                        )}
                        {settings.instagram && (
                          <a
                            href={settings.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-500 hover:text-[#991B1B] transition"
                          >
                            Instagram
                          </a>
                        )}
                        {settings.youtube && (
                          <a
                            href={settings.youtube}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-500 hover:text-[#991B1B] transition"
                          >
                            YouTube
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Map Placeholder */}
              <div className="mt-10">
                <h3 className="font-semibold text-gray-900 mb-4">Lokasi</h3>
                <div className="w-full h-64 bg-gray-200 rounded-xl overflow-hidden">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31890.68!2d99.54!3d0.84!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x302726c8f22e16ef%3A0xc06a604ef76a7a4d!2sPanyabungan%2C%20Mandailing%20Natal%20Regency%2C%20North%20Sumatra!5e0!3m2!1sid!2sid!4v1"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Peta lokasi SMAN 1 Panyabungan"
                  />
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Kirim Pesan
              </h2>
              <div className="w-16 h-1 bg-[#991B1B] mb-8 rounded-full" />

              <form className="space-y-6">
                <div>
                  <label
                    htmlFor="nama"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    id="nama"
                    name="nama"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#991B1B] focus:border-transparent outline-none transition"
                    placeholder="Masukkan nama lengkap"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#991B1B] focus:border-transparent outline-none transition"
                    placeholder="Masukkan alamat email"
                  />
                </div>

                <div>
                  <label
                    htmlFor="subjek"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Subjek
                  </label>
                  <input
                    type="text"
                    id="subjek"
                    name="subjek"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#991B1B] focus:border-transparent outline-none transition"
                    placeholder="Subjek pesan"
                  />
                </div>

                <div>
                  <label
                    htmlFor="pesan"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Pesan
                  </label>
                  <textarea
                    id="pesan"
                    name="pesan"
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#991B1B] focus:border-transparent outline-none transition resize-none"
                    placeholder="Tulis pesan Anda"
                  />
                </div>

                <button
                  type="button"
                  className="w-full px-6 py-3 text-base font-semibold text-white bg-[#991B1B] rounded-lg hover:bg-[#7F1D1D] transition"
                >
                  Kirim Pesan
                </button>

                <p className="text-xs text-gray-500 text-center">
                  Formulir kontak ini belum aktif. Silakan hubungi kami melalui
                  email atau telepon.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
