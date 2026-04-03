import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const [albums, total] = await Promise.all([
      prisma.album.findMany({
        skip,
        take: limit,
        include: {
          _count: { select: { fotos: true } },
          fotos: { take: 1, orderBy: { createdAt: "asc" } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.album.count(),
    ]);

    return NextResponse.json({
      data: albums,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Galeri GET error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as { role: string }).role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { judul, deskripsi, coverImage } = body;

    if (!judul) {
      return NextResponse.json(
        { error: "Judul wajib diisi" },
        { status: 400 }
      );
    }

    const album = await prisma.album.create({
      data: {
        judul,
        deskripsi: deskripsi || null,
        coverImage: coverImage || null,
      },
    });

    return NextResponse.json(album, { status: 201 });
  } catch (error) {
    console.error("Galeri POST error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
