import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || (session.user as { role?: string })?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { action, adminNote } = body;

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Aksi tidak valid" }, { status: 400 });
    }

    const submission = await prisma.submission.findUnique({ where: { id } });
    if (!submission) {
      return NextResponse.json({ error: "Pengajuan tidak ditemukan" }, { status: 404 });
    }

    if (action === "approve") {
      const data = JSON.parse(submission.data);

      if (submission.type === "BERITA") {
        if (data.editTargetId) {
          // Edit existing berita — recompute slug only if title changed
          let newSlug = slugify(data.judul || "berita");
          const slugConflict = await prisma.berita.findFirst({
            where: { slug: newSlug, NOT: { id: data.editTargetId } },
          });
          if (slugConflict) newSlug = `${newSlug}-${Date.now()}`;
          const VALID_KAT = ["BERITA", "ARTIKEL", "OPINI", "CERPEN"];
          const kategoriEdit = VALID_KAT.includes(data.kategori) ? data.kategori : undefined;
          await prisma.berita.update({
            where: { id: data.editTargetId },
            data: {
              judul: data.judul,
              slug: newSlug,
              konten: data.konten,
              ringkasan: data.ringkasan || null,
              penulis: data.penulis || "Alumni",
              gambar: data.gambar || null,
              ...(kategoriEdit && { kategori: kategoriEdit }),
            },
          });
        } else {
          let slug = slugify(data.judul || "berita");
          const existing = await prisma.berita.findUnique({ where: { slug } });
          if (existing) slug = `${slug}-${Date.now()}`;
          const VALID_KAT = ["BERITA", "ARTIKEL", "OPINI", "CERPEN"];
          const kategoriNew = VALID_KAT.includes(data.kategori) ? data.kategori : "BERITA";
          await prisma.berita.create({
            data: {
              judul: data.judul,
              slug,
              konten: data.konten,
              ringkasan: data.ringkasan || null,
              penulis: data.penulis || "Alumni",
              gambar: data.gambar || null,
              kategori: kategoriNew,
              published: true,
            },
          });
        }
      } else if (submission.type === "AGENDA") {
        if (data.editTargetId) {
          // Edit existing agenda
          await prisma.agenda.update({
            where: { id: data.editTargetId },
            data: {
              judul: data.judul,
              deskripsi: data.deskripsi,
              tanggal: new Date(data.tanggal),
              lokasi: data.lokasi,
            },
          });
        } else {
          await prisma.agenda.create({
            data: {
              judul: data.judul,
              deskripsi: data.deskripsi,
              tanggal: new Date(data.tanggal),
              lokasi: data.lokasi,
            },
          });
        }
      } else if (submission.type === "ALBUM") {
        if (data.editTargetId) {
          // Add photos to existing album
          const addFotos: string[] = Array.isArray(data.addFotos) ? data.addFotos : [];
          if (addFotos.length > 0) {
            await prisma.foto.createMany({
              data: addFotos.map((url: string) => ({ albumId: data.editTargetId, url })),
            });
          }
        } else {
          const album = await prisma.album.create({
            data: {
              judul: data.judul,
              deskripsi: data.deskripsi || null,
            },
          });
          const fotos: string[] = Array.isArray(data.fotos) ? data.fotos : [];
          if (fotos.length > 0) {
            await prisma.foto.createMany({
              data: fotos.map((url: string) => ({ albumId: album.id, url })),
            });
          }
        }
      } else if (submission.type === "SETTINGS") {
        const updateData: Record<string, string> = {};
        if (data.section === "tentang") {
          if (data.sejarah !== undefined) updateData.sejarah = data.sejarah;
          if (data.visi !== undefined) updateData.visi = data.visi;
          if (data.misi !== undefined) updateData.misi = data.misi;
        } else if (data.section === "kontak") {
          if (data.alamat !== undefined) updateData.alamat = data.alamat;
          if (data.email !== undefined) updateData.email = data.email;
          if (data.telepon !== undefined) updateData.telepon = data.telepon;
          if (data.facebook !== undefined) updateData.facebook = data.facebook;
          if (data.instagram !== undefined) updateData.instagram = data.instagram;
          if (data.youtube !== undefined) updateData.youtube = data.youtube;
        }
        await prisma.siteSettings.upsert({
          where: { id: "default" },
          update: updateData,
          create: { id: "default", ...updateData },
        });
      } else if (submission.type === "ALUMNI_PILIHAN") {
        await prisma.alumniPilihan.create({
          data: {
            nama: data.nama,
            tahunLulus: parseInt(data.tahunLulus),
            pekerjaan: data.pekerjaan,
            foto: data.foto || null,
            ringkasan: data.ringkasan,
            kisah: data.kisah,
            published: true,
          },
        });
      } else if (submission.type === "INFO") {
        await prisma.info.create({
          data: {
            judul: data.judul,
            kategori: data.kategori,
            ringkasan: data.ringkasan,
            konten: data.konten,
            gambar: data.gambar || null,
            kontak: data.kontak || null,
            link: data.link || null,
            expiredAt: data.expiredAt ? new Date(data.expiredAt) : null,
            published: true,
            createdBy: submission.userId,
          },
        });
      }
    }

    const updated = await prisma.submission.update({
      where: { id },
      data: {
        status: action === "approve" ? "APPROVED" : "REJECTED",
        adminNote: adminNote || null,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Submission PATCH error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
