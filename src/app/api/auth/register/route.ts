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

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email sudah terdaftar" },
        { status: 400 }
      );
    }

    const tahunLulusInt = parseInt(tahunLulus);
    const hashedPassword = await bcrypt.hash(password, 12);
    const verifyToken = crypto.randomUUID();
    const verifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const newUser = await prisma.user.create({
      data: {
        nama,
        email,
        password: hashedPassword,
        verifyToken,
        verifyExpires,
        alumni: {
          create: {
            namaLengkap,
            tahunLulus: tahunLulusInt,
            pekerjaan,
            alamat,
            noHp: noHp || null,
          },
        },
      },
    });

    // --- Duplicate detection ---
    const duplicates: string[] = [];

    // 1. Check against imported alumni directory (by name+year or phone)
    const importedMatch = await prisma.alumniImport.findFirst({
      where: {
        OR: [
          {
            AND: [
              { namaLengkap: { equals: namaLengkap, mode: "insensitive" } },
              { tahunLulus: tahunLulusInt },
            ],
          },
          ...(noHp ? [{ noHp: { contains: noHp.replace(/\D/g, "").slice(-8) } }] : []),
        ],
      },
    });

    if (importedMatch) {
      duplicates.push(
        `Cocok dengan data alumni existing: **${importedMatch.namaLengkap}** (angkatan ${importedMatch.tahunLulus})`
      );
      // Link the imported record to the new user
      await prisma.alumniImport.update({
        where: { id: importedMatch.id },
        data: { linkedUserId: newUser.id },
      });
    }

    // 2. Check against already-registered alumni (same name+year, different user)
    const registeredMatch = await prisma.alumni.findFirst({
      where: {
        AND: [
          { namaLengkap: { equals: namaLengkap, mode: "insensitive" } },
          { tahunLulus: tahunLulusInt },
          { userId: { not: newUser.id } },
        ],
      },
      include: { user: { select: { email: true } } },
    });

    if (registeredMatch) {
      duplicates.push(
        `Nama & angkatan sama dengan akun terdaftar: **${registeredMatch.namaLengkap}** (${registeredMatch.user.email})`
      );
    }

    // 3. Create admin notification if duplicates found
    if (duplicates.length > 0) {
      await prisma.adminNotification.create({
        data: {
          type: "POTENTIAL_DUPLICATE",
          message: `Pendaftaran baru berpotensi duplikat: **${namaLengkap}** (${email}, angkatan ${tahunLulusInt})`,
          data: JSON.stringify({
            userId: newUser.id,
            namaLengkap,
            email,
            tahunLulus: tahunLulusInt,
            matches: duplicates,
          }),
        },
      });
    }

    try {
      await sendVerificationEmail(email, verifyToken);
    } catch {
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
