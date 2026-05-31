import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const [topics, total] = await Promise.all([
      prisma.markomburTopic.findMany({
        skip,
        take: limit,
        orderBy: { updatedAt: "desc" },
        include: {
          author: { select: { id: true, nama: true } },
          _count: { select: { komentar: true } },
        },
      }),
      prisma.markomburTopic.count(),
    ]);

    return NextResponse.json({
      data: topics,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Markombur GET error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Login diperlukan" }, { status: 401 });
    }

    const body = await request.json();
    const { judul, deskripsi } = body;

    if (!judul || !deskripsi) {
      return NextResponse.json(
        { error: "Judul dan deskripsi wajib diisi" },
        { status: 400 }
      );
    }
    if (judul.length > 200) {
      return NextResponse.json({ error: "Judul maksimal 200 karakter" }, { status: 400 });
    }

    const topic = await prisma.markomburTopic.create({
      data: {
        judul: judul.trim(),
        deskripsi: deskripsi.trim(),
        authorId: (session.user as { id: string }).id,
      },
      include: {
        author: { select: { id: true, nama: true } },
      },
    });

    return NextResponse.json(topic, { status: 201 });
  } catch (error) {
    console.error("Markombur POST error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
