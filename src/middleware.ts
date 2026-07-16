import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const publicRoutes = ["/", "/login", "/register", "/agendamento"];

const adminRoutes = [
  "/dashboard/barbeiros",
  "/dashboard/clientes",
  "/dashboard/servicos",
  "/dashboard/relatorios",
  "/dashboard/config",
];

const staffRoutes = ["/dashboard", "/dashboard/agenda"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const authObj = req.auth as { user?: { role?: string } } | null;
  const isAuthenticated = !!authObj;
  const userRole = authObj?.user?.role;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/services") ||
    pathname.startsWith("/api/barbers") ||
    pathname.startsWith("/api/appointments/available-slots")
  ) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    if (!isAuthenticated) {
      return NextResponse.json({ ok: false, error: "Não autenticado" }, { status: 401 });
    }
    const isAdminRoute = pathname.startsWith("/api/users") || pathname.startsWith("/api/dashboard");
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
    return NextResponse.redirect(new URL("/agendamento", req.url));
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
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
