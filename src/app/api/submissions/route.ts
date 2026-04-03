import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

const VALID_TYPES = ["BERITA", "AGENDA", "ALBUM", "SETTINGS"];

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = (session.user as { role?: string })?.role === "ADMIN";
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status") || undefined;
    const skip = (page - 1) * limit;

    const where = isAdmin
      ? status ? { status: status as "PENDING" | "APPROVED" | "REJECTED" } : {}
      : { userId: (session.user as { id: string }).id };

    const [submissions, total] = await Promise.all([
      prisma.submission.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, nama: true, email: true } },
        },
      }),
      prisma.submission.count({ where }),
    ]);

    return NextResponse.json({
      data: submissions,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Submissions GET error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { type, data } = body;

    if (!type || !VALID_TYPES.includes(type)) {
      return NextResponse.json({ error: "Tipe pengajuan tidak valid" }, { status: 400 });
    }
    if (!data || typeof data !== "object") {
      return NextResponse.json({ error: "Data pengajuan tidak valid" }, { status: 400 });
    }

    const submission = await prisma.submission.create({
      data: {
        userId: (session.user as { id: string }).id,
        type,
        data: JSON.stringify(data),
      },
    });

    return NextResponse.json(submission, { status: 201 });
  } catch (error) {
    console.error("Submissions POST error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
