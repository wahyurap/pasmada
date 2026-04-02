import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as { role: string }).role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get("q") || "";
    const tahun = searchParams.get("tahun");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (q) {
      where.namaLengkap = { contains: q, mode: "insensitive" };
    }

    if (tahun) {
      where.tahunLulus = parseInt(tahun);
    }

    const [alumni, total] = await Promise.all([
      prisma.alumni.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              nama: true,
              emailVerified: true,
            },
          },
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
    console.error("Admin alumni GET error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
