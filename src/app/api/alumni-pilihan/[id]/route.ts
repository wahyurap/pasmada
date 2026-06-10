import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { sanitizeHtml } from "@/lib/sanitize";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const item = await prisma.alumniPilihan.findUnique({ where: { id } });
    if (!item) {
      return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });
    }
    if (!item.published) {
      const session = await auth();
      if ((session?.user as { role?: string } | undefined)?.role !== "ADMIN") {
        return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });
      }
    }
    return NextResponse.json(item);
  } catch (error) {
    console.error("AlumniPilihan GET[id] error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || (session.user as { role?: string })?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { nama, tahunLulus, pekerjaan, foto, ringkasan, kisah, published } = body;

    const updated = await prisma.alumniPilihan.update({
      where: { id },
      data: {
        ...(nama !== undefined && { nama }),
        ...(tahunLulus !== undefined && { tahunLulus: parseInt(tahunLulus) }),
        ...(pekerjaan !== undefined && { pekerjaan }),
        ...(foto !== undefined && { foto: foto || null }),
        ...(ringkasan !== undefined && { ringkasan }),
        ...(kisah !== undefined && { kisah: sanitizeHtml(kisah) }),
        ...(published !== undefined && { published }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("AlumniPilihan PATCH error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || (session.user as { role?: string })?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    await prisma.alumniPilihan.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("AlumniPilihan DELETE error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
