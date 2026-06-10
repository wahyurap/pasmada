import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { sanitizeHtml, isHtmlEmpty } from "@/lib/sanitize";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = parseInt(searchParams.get("limit") || "12");
    const skip = (page - 1) * limit;

    const session = await auth();
    const isAdmin = (session?.user as { role?: string } | undefined)?.role === "ADMIN";
    const where = isAdmin ? {} : { published: true };

    const [data, total] = await Promise.all([
      prisma.alumniPilihan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.alumniPilihan.count({ where }),
    ]);

    return NextResponse.json({
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("AlumniPilihan GET error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as { role?: string })?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { nama, tahunLulus, pekerjaan, foto, ringkasan, kisah, published } = body;

    if (!nama || !tahunLulus || !pekerjaan || !ringkasan || isHtmlEmpty(kisah)) {
      return NextResponse.json(
        { error: "Nama, tahun lulus, pekerjaan, ringkasan, dan kisah wajib diisi" },
        { status: 400 }
      );
    }

    const created = await prisma.alumniPilihan.create({
      data: {
        nama,
        tahunLulus: parseInt(tahunLulus),
        pekerjaan,
        foto: foto || null,
        ringkasan,
        kisah: sanitizeHtml(kisah),
        published: published !== false,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("AlumniPilihan POST error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
