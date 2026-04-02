import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    let settings = await prisma.siteSettings.findUnique({
      where: { id: "default" },
    });

    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: { id: "default" },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Settings GET error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as { role: string }).role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      namaOrganisasi,
      deskripsi,
      sambutanKetua,
      heroImage,
      alamat,
      email,
      telepon,
      facebook,
      instagram,
      youtube,
    } = body;

    const settings = await prisma.siteSettings.upsert({
      where: { id: "default" },
      update: {
        ...(namaOrganisasi !== undefined && { namaOrganisasi }),
        ...(deskripsi !== undefined && { deskripsi }),
        ...(sambutanKetua !== undefined && { sambutanKetua }),
        ...(heroImage !== undefined && { heroImage }),
        ...(alamat !== undefined && { alamat }),
        ...(email !== undefined && { email }),
        ...(telepon !== undefined && { telepon }),
        ...(facebook !== undefined && { facebook }),
        ...(instagram !== undefined && { instagram }),
        ...(youtube !== undefined && { youtube }),
      },
      create: {
        id: "default",
        ...(namaOrganisasi !== undefined && { namaOrganisasi }),
        ...(deskripsi !== undefined && { deskripsi }),
        ...(sambutanKetua !== undefined && { sambutanKetua }),
        ...(heroImage !== undefined && { heroImage }),
        ...(alamat !== undefined && { alamat }),
        ...(email !== undefined && { email }),
        ...(telepon !== undefined && { telepon }),
        ...(facebook !== undefined && { facebook }),
        ...(instagram !== undefined && { instagram }),
        ...(youtube !== undefined && { youtube }),
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Settings PUT error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
