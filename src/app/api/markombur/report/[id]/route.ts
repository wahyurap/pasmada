import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

// PATCH: mark report resolved (with optional action: delete topic/comment)
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
    const { action } = body;

    const report = await prisma.markomburReport.findUnique({ where: { id } });
    if (!report) {
      return NextResponse.json({ error: "Laporan tidak ditemukan" }, { status: 404 });
    }

    if (action === "delete_content") {
      if (report.komentarId) {
        await prisma.markomburKomentar.delete({ where: { id: report.komentarId } }).catch(() => {});
      } else if (report.topicId) {
        await prisma.markomburTopic.delete({ where: { id: report.topicId } }).catch(() => {});
      }
    }

    const updated = await prisma.markomburReport.update({
      where: { id },
      data: { resolved: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Markombur report PATCH error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
