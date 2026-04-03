import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const settings = await prisma.siteSettings.findFirst({ where: { id: "default" } });
    return NextResponse.json(settings || {});
  } catch (error) {
    console.error("Settings GET error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as { role: string }).role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const {
      namaOrganisasi, deskripsi, sambutanKetua,
      alamat, email, telepon,
      facebook, instagram, youtube,
    } = body;

    const settings = await prisma.siteSettings.upsert({
      where: { id: "default" },
      update: {
        namaOrganisasi, deskripsi, sambutanKetua,
        alamat, email, telepon,
        facebook: facebook || null,
        instagram: instagram || null,
        youtube: youtube || null,
      },
      create: {
        id: "default",
        namaOrganisasi, deskripsi, sambutanKetua,
        alamat, email, telepon,
        facebook: facebook || null,
        instagram: instagram || null,
        youtube: youtube || null,
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Settings PATCH error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
