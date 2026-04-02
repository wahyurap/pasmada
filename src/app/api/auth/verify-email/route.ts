import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: "Token tidak valid" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { verifyToken: token },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Token tidak valid atau sudah digunakan" },
        { status: 400 }
      );
    }

    if (user.verifyExpires && user.verifyExpires < new Date()) {
      return NextResponse.json(
        { error: "Token sudah kedaluwarsa. Silakan daftar ulang." },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        verifyToken: null,
        verifyExpires: null,
      },
    });

    return NextResponse.json({ message: "Email berhasil diverifikasi" });
  } catch (error) {
    console.error("Verify email error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
