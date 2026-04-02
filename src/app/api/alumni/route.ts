import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Rate limit alumni search: 60 requests per minute per user
    const { success } = rateLimit(`alumni-search:${session.user.id}`, 60, 60_000);
    if (!success) {
      return NextResponse.json(
        { error: "Terlalu banyak permintaan. Coba lagi sebentar." },
        { status: 429 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get("q") || "";
    const tahun = searchParams.get("tahun");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    type AlumniWhere = {
      tahunLulus?: number;
      OR?: Array<Record<string, { contains: string; mode: string }>>;
    };
    const where: AlumniWhere = {};

    if (q) {
      where.OR = [
        { namaLengkap: { contains: q, mode: "insensitive" } },
        { pekerjaan: { contains: q, mode: "insensitive" } },
        { alamat: { contains: q, mode: "insensitive" } },
      ];
    }

    if (tahun) {
      where.tahunLulus = parseInt(tahun);
    }

    const [alumni, total] = await Promise.all([
      prisma.alumni.findMany({
        where,
        select: {
          id: true,
          namaLengkap: true,
          tahunLulus: true,
          pekerjaan: true,
          alamat: true,
          foto: true,
        },
        skip,
        take: limit,
        orderBy: { namaLengkap: "asc" },
      }),
      prisma.alumni.count({ where }),
    ]);

    return NextResponse.json({
      data: alumni,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Alumni GET error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
