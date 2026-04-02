export default function TentangPage() {
  return (
    <>
      {/* Hero Banner */}
      <section className="bg-[#1e40af] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            Tentang PASMADA
          </h1>
          <p className="mt-3 text-blue-200 text-lg max-w-2xl mx-auto">
            Mengenal lebih dekat organisasi alumni SMAN 1 Panyabungan
          </p>
        </div>
      </section>

      {/* Sejarah */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Sejarah</h2>
          <div className="w-16 h-1 bg-[#1e40af] mb-8 rounded-full" />
          <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
            <p>
              PASMADA (Parsadaan Alumni SMAN Sada) adalah organisasi alumni yang
              menghimpun seluruh lulusan SMAN 1 Panyabungan, Kabupaten Mandailing
              Natal, Sumatera Utara. Organisasi ini didirikan dengan semangat
              kebersamaan dan kepedulian terhadap almamater serta sesama alumni.
            </p>
            <p>
              SMAN 1 Panyabungan merupakan salah satu sekolah menengah atas
              tertua dan terkemuka di Kabupaten Mandailing Natal. Selama puluhan
              tahun berdiri, sekolah ini telah menghasilkan ribuan alumni yang
              tersebar di berbagai penjuru Indonesia dan mancanegara, berkiprah di
              berbagai bidang profesi dan kehidupan.
            </p>
            <p>
              PASMADA hadir sebagai wadah untuk menjembatani komunikasi antar
              alumni lintas angkatan, memfasilitasi kegiatan silaturahmi, serta
              mengkoordinasikan program-program yang bermanfaat bagi almamater,
              sesama alumni, dan masyarakat luas.
            </p>
          </div>
        </div>
      </section>

      {/* Visi & Misi */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Visi & Misi</h2>
          <div className="w-16 h-1 bg-[#1e40af] mb-8 rounded-full" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-8 border border-gray-100 shadow-sm">
              <h3 className="text-xl font-bold text-[#1e40af] mb-4">Visi</h3>
              <p className="text-gray-700 leading-relaxed">
                Menjadi organisasi alumni yang solid, profesional, dan
                berkontribusi nyata bagi kemajuan almamater SMAN 1 Panyabungan
                serta kesejahteraan anggotanya.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 border border-gray-100 shadow-sm">
              <h3 className="text-xl font-bold text-[#1e40af] mb-4">Misi</h3>
              <ul className="text-gray-700 space-y-3 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-[#1e40af] rounded-full mt-2 shrink-0" />
                  Mempererat tali silaturahmi antar alumni lintas angkatan
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-[#1e40af] rounded-full mt-2 shrink-0" />
                  Mendukung pengembangan dan kemajuan SMAN 1 Panyabungan
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-[#1e40af] rounded-full mt-2 shrink-0" />
                  Memfasilitasi jejaring dan pengembangan karir alumni
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-[#1e40af] rounded-full mt-2 shrink-0" />
                  Menyelenggarakan kegiatan sosial dan kepedulian masyarakat
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-[#1e40af] rounded-full mt-2 shrink-0" />
                  Membangun database alumni yang komprehensif dan terintegrasi
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Struktur Organisasi */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Struktur Organisasi
          </h2>
          <div className="w-16 h-1 bg-[#1e40af] mb-8 rounded-full" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { jabatan: "Ketua Umum", nama: "-" },
              { jabatan: "Wakil Ketua", nama: "-" },
              { jabatan: "Sekretaris", nama: "-" },
              { jabatan: "Bendahara", nama: "-" },
              { jabatan: "Humas", nama: "-" },
              { jabatan: "Koordinator Wilayah", nama: "-" },
            ].map((item) => (
              <div
                key={item.jabatan}
                className="bg-gray-50 rounded-xl p-6 text-center border border-gray-100"
              >
                <div className="w-16 h-16 bg-[#1e40af]/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-[#1e40af]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900">{item.nama}</h4>
                <p className="text-sm text-[#1e40af] mt-1">{item.jabatan}</p>
              </div>
            ))}
          </div>

          <p className="mt-8 text-center text-sm text-gray-500">
            Struktur organisasi akan diperbarui sesuai dengan hasil musyawarah
            terbaru.
          </p>
        </div>
      </section>
    </>
  );
}
