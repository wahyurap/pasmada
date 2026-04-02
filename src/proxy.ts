import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const protectedPaths = ["/alumni", "/profil"];
const adminPaths = ["/admin"];

export async function proxy(request: Request) {
  const { pathname } = new URL(request.url);

  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
  const isAdmin = adminPaths.some((p) => pathname.startsWith(p));

  if (isProtected || isAdmin) {
    const session = await auth();

    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (isAdmin && session.user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/alumni/:path*", "/profil/:path*", "/admin/:path*"],
};
