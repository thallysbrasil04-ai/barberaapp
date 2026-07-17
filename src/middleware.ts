import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

const publicRoutes = ["/", "/login", "/register", "/agendamento", "/privacidade"];

const publicApiPrefixes = [
  "/api/auth",
  "/api/services",
  "/api/barbers",
  "/api/appointments/available-slots",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  if (publicApiPrefixes.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  const isAuthenticated = !!token;
  const userRole = token?.role as string | undefined;

  if (pathname.startsWith("/api/")) {
    if (!isAuthenticated) {
      return NextResponse.json({ ok: false, error: "Não autenticado" }, { status: 401 });
    }
    const isAdminRoute = (pathname.startsWith("/api/users") && !pathname.includes("/delete-account")) || pathname.startsWith("/api/dashboard");
    if (isAdminRoute && userRole !== "ADMIN") {
      return NextResponse.json({ ok: false, error: "Não autorizado" }, { status: 403 });
    }
    return NextResponse.next();
  }

  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  if (!isAuthenticated) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (userRole === "CLIENT") {
    if (pathname.startsWith("/dashboard/agenda")) {
      return NextResponse.next();
    }
    if (pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/agendamento", req.url));
    }
  }

  if (userRole === "BARBER") {
    if (pathname === "/dashboard" || pathname.startsWith("/dashboard/agenda")) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/dashboard/agenda", req.url));
  }

  if (userRole === "ADMIN") {
    if (pathname.startsWith("/dashboard")) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
