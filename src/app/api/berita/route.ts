import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const isAdmin = (session?.user as { role?: string })?.role === "ADMIN";

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Admins can see all berita (including drafts); public only sees published
    const where = isAdmin ? {} : { published: true };

    const [berita, total] = await Promise.all([
      prisma.berita.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.berita.count({ where }),
    ]);

    return NextResponse.json({
      data: berita,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Berita GET error:", error);
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
    const { judul, konten, ringkasan, gambar, published } = body;

    if (!judul || !konten) {
      return NextResponse.json(
        { error: "Judul dan konten wajib diisi" },
        { status: 400 }
      );
    }

    let slug = slugify(judul);

    // Ensure slug uniqueness
    const existing = await prisma.berita.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const berita = await prisma.berita.create({
      data: {
        judul,
        slug,
        konten,
        ringkasan: ringkasan || null,
        gambar: gambar || null,
        penulis: session.user?.name || "Admin",
        published: published ?? false,
      },
    });

    return NextResponse.json(berita, { status: 201 });
  } catch (error) {
    console.error("Berita POST error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
