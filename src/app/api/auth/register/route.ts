import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  // Rate limit: 5 registrations per IP per 15 minutes
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const { success } = rateLimit(`register:${ip}`, 5, 15 * 60_000);
  if (!success) {
    return NextResponse.json(
      { error: "Terlalu banyak percobaan. Coba lagi nanti." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { nama, email, password, namaLengkap, tahunLulus, pekerjaan, alamat, noHp } = body;

    if (!nama || !email || !password || !namaLengkap || !tahunLulus || !pekerjaan || !alamat) {
      return NextResponse.json(
        { error: "Semua field wajib diisi" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password minimal 8 karakter" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email sudah terdaftar" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const verifyToken = crypto.randomUUID();
    const verifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.user.create({
      data: {
        nama,
        email,
        password: hashedPassword,
        verifyToken,
        verifyExpires,
        alumni: {
          create: {
            namaLengkap,
            tahunLulus: parseInt(tahunLulus),
            pekerjaan,
            alamat,
            noHp: noHp || null,
          },
        },
      },
    });

    try {
      await sendVerificationEmail(email, verifyToken);
    } catch {
      // Email sending failed but user is created
      console.error("Failed to send verification email");
    }

    return NextResponse.json(
      { message: "Registrasi berhasil. Silakan cek email untuk verifikasi." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
