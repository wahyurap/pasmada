import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Login diperlukan" }, { status: 401 });
    }

    const { id: topicId } = await params;
    const body = await request.json();
    const { konten } = body;

    if (!konten || !konten.trim()) {
      return NextResponse.json({ error: "Komentar tidak boleh kosong" }, { status: 400 });
    }

    const topic = await prisma.markomburTopic.findUnique({
      where: { id: topicId },
      select: { id: true, isLocked: true },
    });
    if (!topic) {
      return NextResponse.json({ error: "Topik tidak ditemukan" }, { status: 404 });
    }
    if (topic.isLocked) {
      return NextResponse.json({ error: "Topik ini dikunci" }, { status: 403 });
    }

    const komentar = await prisma.markomburKomentar.create({
      data: {
        topicId,
        authorId: (session.user as { id: string }).id,
        konten: konten.trim(),
      },
      include: { author: { select: { id: true, nama: true } } },
    });

    // Bump topic updatedAt so it surfaces in latest activity
    await prisma.markomburTopic.update({
      where: { id: topicId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json(komentar, { status: 201 });
  } catch (error) {
    console.error("Markombur komentar POST error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
