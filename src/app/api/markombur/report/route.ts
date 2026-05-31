import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Login diperlukan" }, { status: 401 });
    }

    const body = await request.json();
    const { topicId, komentarId, alasan } = body;

    if (!alasan || !alasan.trim()) {
      return NextResponse.json({ error: "Alasan wajib diisi" }, { status: 400 });
    }
    if (!topicId && !komentarId) {
      return NextResponse.json({ error: "Topik atau komentar harus dipilih" }, { status: 400 });
    }

    const report = await prisma.markomburReport.create({
      data: {
        reporterId: (session.user as { id: string }).id,
        topicId: topicId || null,
        komentarId: komentarId || null,
        alasan: alasan.trim(),
      },
    });

    // Notify admin
    try {
      await prisma.adminNotification.create({
        data: {
          type: "MARKOMBUR_REPORT",
          message: `Laporan baru di Markombur: ${alasan.slice(0, 100)}`,
          data: JSON.stringify({ reportId: report.id, topicId, komentarId }),
        },
      });
    } catch {
      // notification is best-effort
    }

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    console.error("Markombur report POST error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as { role?: string })?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const resolved = searchParams.get("resolved") === "true";

    const reports = await prisma.markomburReport.findMany({
      where: { resolved },
      orderBy: { createdAt: "desc" },
      include: {
        reporter: { select: { id: true, nama: true, email: true } },
        topic: { select: { id: true, judul: true } },
        komentar: {
          select: {
            id: true,
            konten: true,
            topicId: true,
            topic: { select: { id: true, judul: true } },
          },
        },
      },
    });

    return NextResponse.json({ data: reports });
  } catch (error) {
    console.error("Markombur reports GET error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
