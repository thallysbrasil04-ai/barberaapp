import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

type SessionUser = {
  id: string; name?: string | null; email?: string | null; phone?: string | null; role: string;
  barberId: string | null; avatar?: string | null;
};

type Handler<T = unknown> = (
  req: Request,
  context: { session: SessionUser; params?: Record<string, string> }
) => Promise<T>;

interface ApiRouteOptions {
  requiredRole?: string[];
}

export function apiRoute(handler: Handler, options?: ApiRouteOptions) {
  return async (req: Request, { params }: { params: Promise<Record<string, string>> }) => {
    try {
      const resolvedParams = await params;
      const session = await auth();
      if (!session?.user) {
        return NextResponse.json({ ok: false, error: "Não autenticado" }, { status: 401 });
      }
      if (options?.requiredRole && !options.requiredRole.includes(session.user.role)) {
        return NextResponse.json({ ok: false, error: "Não autorizado" }, { status: 403 });
      }
      const result = await handler(req, { session: session.user, params: resolvedParams });
      if (result instanceof Response) return result;
      if (typeof result === "object" && result !== null && "ok" in (result as Record<string, unknown>)) {
        const r = result as Record<string, unknown>;
        const status = typeof r.status === "number" ? r.status : r.ok ? 200 : 400;
        const { status: _, ...body } = r;
        return NextResponse.json(body, { status });
      }
      return NextResponse.json({ ok: true, data: result });
    } catch (e) {
      console.error("API Error:", e);
      const message = e instanceof Error ? e.message : "Erro interno";
      return NextResponse.json({ ok: false, error: message }, { status: 500 });
    }
  };
}

export function apiError(error: string, status: number) {
  return NextResponse.json({ ok: false, error }, { status });
}
