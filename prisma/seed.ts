import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@pasmada.org" },
    update: {},
    create: {
      nama: "Admin PASMADA",
      email: "admin@pasmada.org",
      password: hashedPassword,
      emailVerified: new Date(),
      role: "ADMIN",
      alumni: {
        create: {
          namaLengkap: "Admin PASMADA",
          tahunLulus: 2000,
          pekerjaan: "Administrator",
          alamat: "Panyabungan, Mandailing Natal",
        },
      },
    },
  });

  console.log("Admin user created:", admin.email);

  // Create site settings
  await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      namaOrganisasi: "PASMADA",
      deskripsi:
        "Parsadaan Alumni SMAN Sada - Organisasi Alumni SMAN 1 Panyabungan",
      sambutanKetua:
        "Selamat datang di website resmi PASMADA. Kami berkomitmen untuk menjaga silaturahmi dan membangun jaringan alumni SMAN 1 Panyabungan yang solid demi kemajuan bersama.",
      alamat: "Jl. Willem Iskandar, Panyabungan, Mandailing Natal, Sumatera Utara",
      email: "info@pasmada.org",
      telepon: "",
    },
  });

  console.log("Site settings created");

  // Create sample alumni
  const sampleAlumni = [
    { nama: "Ahmad Rizki", tahun: 2010, pekerjaan: "Dokter", alamat: "Medan" },
    { nama: "Siti Aminah", tahun: 2012, pekerjaan: "Guru", alamat: "Panyabungan" },
    { nama: "Budi Pratama", tahun: 2008, pekerjaan: "Wiraswasta", alamat: "Jakarta" },
    { nama: "Nurul Hidayah", tahun: 2015, pekerjaan: "PNS", alamat: "Padang" },
    { nama: "Faisal Harahap", tahun: 2005, pekerjaan: "Insinyur", alamat: "Bandung" },
  ];

  for (const alumni of sampleAlumni) {
    const password = await bcrypt.hash("alumni123", 12);
    await prisma.user.upsert({
      where: { email: `${alumni.nama.toLowerCase().replace(/\s/g, ".")}@example.com` },
      update: {},
      create: {
        nama: alumni.nama,
        email: `${alumni.nama.toLowerCase().replace(/\s/g, ".")}@example.com`,
        password,
        emailVerified: new Date(),
        role: "ALUMNI",
        alumni: {
          create: {
            namaLengkap: alumni.nama,
            tahunLulus: alumni.tahun,
            pekerjaan: alumni.pekerjaan,
            alamat: alumni.alamat,
          },
        },
      },
    });
  }

  console.log("Sample alumni created");

  // Create sample berita
  await prisma.berita.upsert({
    where: { slug: "reuni-akbar-pasmada-2024" },
    update: {},
    create: {
      judul: "Reuni Akbar PASMADA 2024",
      slug: "reuni-akbar-pasmada-2024",
      konten:
        "PASMADA mengadakan reuni akbar yang dihadiri oleh ratusan alumni dari berbagai angkatan. Acara ini menjadi ajang silaturahmi dan mempererat tali persaudaraan antar alumni SMAN 1 Panyabungan.",
      ringkasan: "Ratusan alumni berkumpul dalam reuni akbar PASMADA 2024.",
      penulis: "Admin PASMADA",
      published: true,
    },
  });

  await prisma.berita.upsert({
    where: { slug: "beasiswa-pasmada-untuk-siswa-berprestasi" },
    update: {},
    create: {
      judul: "Beasiswa PASMADA untuk Siswa Berprestasi",
      slug: "beasiswa-pasmada-untuk-siswa-berprestasi",
      konten:
        "PASMADA memberikan beasiswa kepada siswa-siswi SMAN 1 Panyabungan yang berprestasi. Program ini merupakan wujud kepedulian alumni terhadap pendidikan generasi penerus.",
      ringkasan: "Program beasiswa untuk siswa berprestasi SMAN 1 Panyabungan.",
      penulis: "Admin PASMADA",
      published: true,
    },
  });

  console.log("Sample berita created");

  // Create sample agenda
  await prisma.agenda.create({
    data: {
      judul: "Rapat Pengurus PASMADA",
      deskripsi: "Rapat koordinasi pengurus PASMADA membahas program kerja tahun depan.",
      tanggal: new Date("2026-05-15T09:00:00"),
      lokasi: "Aula SMAN 1 Panyabungan",
    },
  });

  console.log("Sample agenda created");
  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
