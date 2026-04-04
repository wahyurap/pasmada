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

    type AlumniWhere = {
      tahunLulus?: number;
      OR?: Array<Record<string, { contains: string; mode: string }>>;
    };
    const where: AlumniWhere = {};

    if (q) {
      where.OR = [
        { namaLengkap: { contains: q, mode: "insensitive" } },
        { pekerjaan: { contains: q, mode: "insensitive" } },
      ];
    }

    if (tahun) {
      where.tahunLulus = parseInt(tahun);
    }

    const [alumni, total] = await Promise.all([
      prisma.alumniImport.findMany({
        where,
        include: {
          linkedUser: { select: { id: true, email: true, nama: true } },
        },
        skip,
        take: limit,
        orderBy: { namaLengkap: "asc" },
      }),
      prisma.alumniImport.count({ where }),
    ]);

    const data = alumni.map((a) => ({
      id: a.id,
      namaLengkap: a.namaLengkap,
      tahunLulus: a.tahunLulus,
      pekerjaan: a.pekerjaan,
      alamat: a.alamat,
      noHp: a.noHp,
      linkedUser: a.linkedUser,
    }));

    return NextResponse.json({
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Admin alumni GET error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
