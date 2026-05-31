import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const item = await prisma.info.findUnique({ where: { id } });
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
    console.error("Info GET[id] error:", error);
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
    const { judul, kategori, ringkasan, konten, gambar, kontak, link, expiredAt, published } = body;

    const updated = await prisma.info.update({
      where: { id },
      data: {
        ...(judul !== undefined && { judul }),
        ...(kategori !== undefined && { kategori }),
        ...(ringkasan !== undefined && { ringkasan }),
        ...(konten !== undefined && { konten }),
        ...(gambar !== undefined && { gambar: gambar || null }),
        ...(kontak !== undefined && { kontak: kontak || null }),
        ...(link !== undefined && { link: link || null }),
        ...(expiredAt !== undefined && { expiredAt: expiredAt ? new Date(expiredAt) : null }),
        ...(published !== undefined && { published }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Info PATCH error:", error);
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
    await prisma.info.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Info DELETE error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
