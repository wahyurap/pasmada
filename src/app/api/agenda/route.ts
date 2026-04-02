import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const [agenda, total] = await Promise.all([
      prisma.agenda.findMany({
        skip,
        take: limit,
        orderBy: { tanggal: "desc" },
      }),
      prisma.agenda.count(),
    ]);

    return NextResponse.json({
      data: agenda,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Agenda GET error:", error);
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
    const { judul, deskripsi, tanggal, lokasi, gambar } = body;

    if (!judul || !deskripsi || !tanggal || !lokasi) {
      return NextResponse.json(
        { error: "Judul, deskripsi, tanggal, dan lokasi wajib diisi" },
        { status: 400 }
      );
    }

    const agenda = await prisma.agenda.create({
      data: {
        judul,
        deskripsi,
        tanggal: new Date(tanggal),
        lokasi,
        gambar: gambar || null,
      },
    });

    return NextResponse.json(agenda, { status: 201 });
  } catch (error) {
    console.error("Agenda POST error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
