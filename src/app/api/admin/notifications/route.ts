import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

function isAdmin(session: Awaited<ReturnType<typeof auth>>) {
  return (session?.user as { role?: string })?.role === "ADMIN";
}

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session || !isAdmin(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const unreadOnly = request.nextUrl.searchParams.get("unread") === "true";

  const notifications = await prisma.adminNotification.findMany({
    where: unreadOnly ? { isRead: false } : {},
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const unreadCount = await prisma.adminNotification.count({
    where: { isRead: false },
  });

  return NextResponse.json({ notifications, unreadCount });
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session || !isAdmin(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { id, markAllRead } = body;

  if (markAllRead) {
    await prisma.adminNotification.updateMany({
      where: { isRead: false },
      data: { isRead: true },
    });
  } else if (id) {
    await prisma.adminNotification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  return NextResponse.json({ ok: true });
}
