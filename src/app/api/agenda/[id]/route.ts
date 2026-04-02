import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const agenda = await prisma.agenda.findUnique({ where: { id } });

    if (!agenda) {
      return NextResponse.json(
        { error: "Agenda tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(agenda);
  } catch (error) {
    console.error("Agenda GET by id error:", error);
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
    const { judul, deskripsi, tanggal, lokasi, gambar } = body;

    const existing = await prisma.agenda.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Agenda tidak ditemukan" },
        { status: 404 }
      );
    }

    const agenda = await prisma.agenda.update({
      where: { id },
      data: {
        ...(judul !== undefined && { judul }),
        ...(deskripsi !== undefined && { deskripsi }),
        ...(tanggal !== undefined && { tanggal: new Date(tanggal) }),
        ...(lokasi !== undefined && { lokasi }),
        ...(gambar !== undefined && { gambar }),
      },
    });

    return NextResponse.json(agenda);
  } catch (error) {
    console.error("Agenda PUT error:", error);
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

    const existing = await prisma.agenda.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Agenda tidak ditemukan" },
        { status: 404 }
      );
    }

    await prisma.agenda.delete({ where: { id } });

    return NextResponse.json({ message: "Agenda berhasil dihapus" });
  } catch (error) {
    console.error("Agenda DELETE error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
