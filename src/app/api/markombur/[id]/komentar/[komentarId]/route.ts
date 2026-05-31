import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; komentarId: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Login diperlukan" }, { status: 401 });
    }

    const { komentarId } = await params;
    const komentar = await prisma.markomburKomentar.findUnique({
      where: { id: komentarId },
      select: { authorId: true },
    });
    if (!komentar) {
      return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });
    }

    const userId = (session.user as { id: string }).id;
    const isAdmin = (session.user as { role?: string })?.role === "ADMIN";
    if (komentar.authorId !== userId && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.markomburKomentar.delete({ where: { id: komentarId } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Markombur komentar DELETE error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
