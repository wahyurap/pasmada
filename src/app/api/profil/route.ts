import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user?.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nama: true,
        email: true,
        role: true,
        alumni: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Profil GET error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user?.id;
    const body = await request.json();
    const { nama, namaLengkap, pekerjaan, alamat, noHp, foto } = body;

    // Update user name if provided
    if (nama !== undefined) {
      await prisma.user.update({
        where: { id: userId },
        data: { nama },
      });
    }

    // Update alumni profile if alumni fields provided
    const alumniData: Record<string, unknown> = {};
    if (namaLengkap !== undefined) alumniData.namaLengkap = namaLengkap;
    if (pekerjaan !== undefined) alumniData.pekerjaan = pekerjaan;
    if (alamat !== undefined) alumniData.alamat = alamat;
    if (noHp !== undefined) alumniData.noHp = noHp;
    if (foto !== undefined) alumniData.foto = foto;

    if (Object.keys(alumniData).length > 0) {
      await prisma.alumni.update({
        where: { userId },
        data: alumniData,
      });
    }

    // Return updated profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nama: true,
        email: true,
        role: true,
        alumni: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Profil PUT error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
