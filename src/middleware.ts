import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const publicRoutes = ["/", "/login", "/register", "/agendamento", "/privacidade"];

const publicApiPrefixes = [
  "/api/auth",
  "/api/services",
  "/api/barbers",
  "/api/appointments/available-slots",
];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname === "/favicon.ico"
  ) {
    return;
  }

  if (publicApiPrefixes.some((p) => pathname.startsWith(p))) {
    return;
  }

  const isAuthenticated = !!session?.user;
  const userRole = session?.user?.role as string | undefined;

  if (pathname.startsWith("/api/")) {
    if (!isAuthenticated) {
      return NextResponse.json({ ok: false, error: "Não autenticado" }, { status: 401 });
    }
    const isAdminRoute = (pathname.startsWith("/api/users") && !pathname.includes("/delete-account")) || pathname.startsWith("/api/dashboard");
    if (isAdminRoute && userRole !== "ADMIN") {
      return NextResponse.json({ ok: false, error: "Não autorizado" }, { status: 403 });
    }
    return;
  }

  if (publicRoutes.includes(pathname)) {
    return;
  }

  if (!isAuthenticated) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (userRole === "CLIENT") {
    if (pathname.startsWith("/dashboard/agenda")) {
      return;
    }
    if (pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/agendamento", req.url));
    }
  }

  if (userRole === "BARBER") {
    if (pathname === "/dashboard" || pathname.startsWith("/dashboard/agenda")) {
      return;
    }
    return NextResponse.redirect(new URL("/dashboard/agenda", req.url));
  }

  if (userRole === "ADMIN") {
    if (pathname.startsWith("/dashboard")) {
      return;
    }
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return;
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
