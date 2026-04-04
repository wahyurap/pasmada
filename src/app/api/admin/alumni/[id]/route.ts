import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

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
    const { namaLengkap, tahunLulus, pekerjaan, alamat, noHp } = body;

    const existing = await prisma.alumniImport.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Alumni tidak ditemukan" },
        { status: 404 }
      );
    }

    const alumni = await prisma.alumniImport.update({
      where: { id },
      data: {
        ...(namaLengkap !== undefined && { namaLengkap }),
        ...(tahunLulus !== undefined && { tahunLulus: parseInt(tahunLulus) }),
        ...(pekerjaan !== undefined && { pekerjaan }),
        ...(alamat !== undefined && { alamat }),
        ...(noHp !== undefined && { noHp }),
      },
    });

    return NextResponse.json(alumni);
  } catch (error) {
    console.error("Admin alumni PUT error:", error);
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

    const existing = await prisma.alumniImport.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Alumni tidak ditemukan" },
        { status: 404 }
      );
    }

    await prisma.alumniImport.delete({ where: { id } });

    return NextResponse.json({ message: "Alumni berhasil dihapus" });
  } catch (error) {
    console.error("Admin alumni DELETE error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
