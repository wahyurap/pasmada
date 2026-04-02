import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || (session.user as { role: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { action } = body;

  try {
    if (action === "verify") {
      await prisma.user.update({
        where: { id },
        data: {
          emailVerified: new Date(),
          verifyToken: null,
          verifyExpires: null,
        },
      });
      return NextResponse.json({ message: "Email berhasil diverifikasi" });
    }

    if (action === "set_role") {
      const { role } = body;
      if (!["ADMIN", "ALUMNI"].includes(role)) {
        return NextResponse.json({ error: "Role tidak valid" }, { status: 400 });
      }
      await prisma.user.update({ where: { id }, data: { role } });
      return NextResponse.json({ message: "Role berhasil diubah" });
    }

    return NextResponse.json({ error: "Action tidak valid" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Gagal memperbarui pengguna" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || (session.user as { role: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Jangan hapus diri sendiri
  if (session.user.id === id) {
    return NextResponse.json({ error: "Tidak bisa menghapus akun sendiri" }, { status: 400 });
  }

  try {
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ message: "Pengguna berhasil dihapus" });
  } catch {
    return NextResponse.json({ error: "Gagal menghapus pengguna" }, { status: 500 });
  }
}
