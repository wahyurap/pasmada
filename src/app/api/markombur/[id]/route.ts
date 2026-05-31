import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const topic = await prisma.markomburTopic.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, nama: true } },
        komentar: {
          orderBy: { createdAt: "asc" },
          include: { author: { select: { id: true, nama: true } } },
        },
      },
    });
    if (!topic) {
      return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json(topic);
  } catch (error) {
    console.error("Markombur GET[id] error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || (session.user as { role?: string })?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const { id } = await params;
    await prisma.markomburTopic.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Markombur DELETE error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
