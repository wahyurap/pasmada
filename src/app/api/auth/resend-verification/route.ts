import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const { success } = rateLimit(`resend-verify:${ip}`, 3, 15 * 60_000);
  if (!success) {
    return NextResponse.json(
      { error: "Terlalu banyak percobaan. Coba lagi dalam 15 menit." },
      { status: 429 }
    );
  }

  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: "Email wajib diisi" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // Selalu balas sukses agar tidak bocorkan info akun
    if (!user || user.emailVerified) {
      return NextResponse.json({
        message: "Jika email terdaftar dan belum diverifikasi, link verifikasi telah dikirim.",
      });
    }

    const verifyToken = crypto.randomUUID();
    const verifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.user.update({
      where: { email },
      data: { verifyToken, verifyExpires },
    });

    await sendVerificationEmail(email, verifyToken);

    return NextResponse.json({
      message: "Jika email terdaftar dan belum diverifikasi, link verifikasi telah dikirim.",
    });
  } catch {
    return NextResponse.json({ error: "Gagal mengirim email" }, { status: 500 });
  }
}
