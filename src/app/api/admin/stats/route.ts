import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session || (session.user as { role: string }).role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const [totalAlumni, totalBerita, totalAgenda, totalAlbums] =
      await Promise.all([
        prisma.alumni.count(),
        prisma.berita.count(),
        prisma.agenda.count(),
        prisma.album.count(),
      ]);

    return NextResponse.json({
      totalAlumni,
      totalBerita,
      totalAgenda,
      totalAlbums,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
