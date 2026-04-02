import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; fotoId: string }> }
) {
  try {
    const session = await auth();
    if (!session || (session.user as { role: string }).role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const { id: albumId, fotoId } = await params;

    // Verify the foto belongs to the specified album
    const foto = await prisma.foto.findUnique({
      where: { id: fotoId },
    });

    if (!foto) {
      return NextResponse.json(
        { error: "Foto tidak ditemukan" },
        { status: 404 }
      );
    }

    if (foto.albumId !== albumId) {
      return NextResponse.json(
        { error: "Foto tidak termasuk dalam album ini" },
        { status: 403 }
      );
    }

    await prisma.foto.delete({ where: { id: fotoId } });

    return NextResponse.json({ message: "Foto berhasil dihapus" });
  } catch (error) {
    console.error("Foto DELETE error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
