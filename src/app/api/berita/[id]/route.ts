import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const berita = await prisma.berita.findUnique({ where: { id } });

    if (!berita) {
      return NextResponse.json(
        { error: "Berita tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(berita);
  } catch (error) {
    console.error("Berita GET by id error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || (session.user as { role: string }).role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { judul, konten, ringkasan, gambar, published } = body;

    const existing = await prisma.berita.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Berita tidak ditemukan" },
        { status: 404 }
      );
    }

    const berita = await prisma.berita.update({
      where: { id },
      data: {
        ...(judul !== undefined && { judul }),
        ...(konten !== undefined && { konten }),
        ...(ringkasan !== undefined && { ringkasan }),
        ...(gambar !== undefined && { gambar }),
        ...(published !== undefined && { published }),
      },
    });

    return NextResponse.json(berita);
  } catch (error) {
    console.error("Berita PUT error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || (session.user as { role: string }).role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const { id } = await params;

    const existing = await prisma.berita.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Berita tidak ditemukan" },
        { status: 404 }
      );
    }

    await prisma.berita.delete({ where: { id } });

    return NextResponse.json({ message: "Berita berhasil dihapus" });
  } catch (error) {
    console.error("Berita DELETE error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
