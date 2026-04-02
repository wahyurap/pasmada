import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const album = await prisma.album.findUnique({
      where: { id },
      include: {
        fotos: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!album) {
      return NextResponse.json(
        { error: "Album tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(album);
  } catch (error) {
    console.error("Album GET by id error:", error);
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
    const { judul, deskripsi, coverImage } = body;

    const existing = await prisma.album.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Album tidak ditemukan" },
        { status: 404 }
      );
    }

    const album = await prisma.album.update({
      where: { id },
      data: {
        ...(judul !== undefined && { judul }),
        ...(deskripsi !== undefined && { deskripsi }),
        ...(coverImage !== undefined && { coverImage }),
      },
    });

    return NextResponse.json(album);
  } catch (error) {
    console.error("Album PUT error:", error);
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

    const existing = await prisma.album.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Album tidak ditemukan" },
        { status: 404 }
      );
    }

    await prisma.album.delete({ where: { id } });

    return NextResponse.json({ message: "Album berhasil dihapus" });
  } catch (error) {
    console.error("Album DELETE error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
