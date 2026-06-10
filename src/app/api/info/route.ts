import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { sanitizeHtml, isHtmlEmpty } from "@/lib/sanitize";

const KATEGORI = ["LOKER", "USAHA", "AGEN", "LAINNYA"] as const;
type Kategori = typeof KATEGORI[number];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = parseInt(searchParams.get("limit") || "12");
    const kategori = searchParams.get("kategori");
    const skip = (page - 1) * limit;

    const session = await auth();
    const isAdmin = (session?.user as { role?: string } | undefined)?.role === "ADMIN";

    const where: {
      published?: boolean;
      kategori?: Kategori;
      OR?: Array<{ expiredAt: { gte: Date } } | { expiredAt: null }>;
    } = isAdmin ? {} : { published: true };

    if (kategori && KATEGORI.includes(kategori as Kategori)) {
      where.kategori = kategori as Kategori;
    }

    // Hide expired items for non-admin
    if (!isAdmin) {
      where.OR = [
        { expiredAt: { gte: new Date() } },
        { expiredAt: null },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.info.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.info.count({ where }),
    ]);

    return NextResponse.json({
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Info GET error:", error);
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
    const { judul, kategori, ringkasan, konten, gambar, kontak, link, expiredAt, published } = body;

    if (!judul || !kategori || !ringkasan || isHtmlEmpty(konten)) {
      return NextResponse.json(
        { error: "Judul, kategori, ringkasan, dan konten wajib diisi" },
        { status: 400 }
      );
    }
    if (!KATEGORI.includes(kategori)) {
      return NextResponse.json({ error: "Kategori tidak valid" }, { status: 400 });
    }

    const created = await prisma.info.create({
      data: {
        judul,
        kategori,
        ringkasan,
        konten: sanitizeHtml(konten),
        gambar: gambar || null,
        kontak: kontak || null,
        link: link || null,
        expiredAt: expiredAt ? new Date(expiredAt) : null,
        published: published !== false,
        createdBy: (session.user as { id: string }).id,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Info POST error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
