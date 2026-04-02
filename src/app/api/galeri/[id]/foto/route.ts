import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { saveFile } from "@/lib/upload";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || (session.user as { role: string }).role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const { id } = await params;

    const album = await prisma.album.findUnique({ where: { id } });
    if (!album) {
      return NextResponse.json(
        { error: "Album tidak ditemukan" },
        { status: 404 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const caption = formData.get("caption") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "File wajib diupload" },
        { status: 400 }
      );
    }

    const url = await saveFile(file, "galeri");

    const foto = await prisma.foto.create({
      data: {
        albumId: id,
        url,
        caption: caption || null,
      },
    });

    return NextResponse.json(foto, { status: 201 });
  } catch (error) {
    console.error("Foto POST error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
