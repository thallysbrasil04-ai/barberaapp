"use client";

import { Suspense } from "react";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Scissors, Loader2 } from "lucide-react";
import { loginSchema } from "@/validators";
import { useToastContext } from "@/providers/toast-provider";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToastContext();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const result = loginSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (res?.error) {
        addToast("E-mail ou senha inválidos", "error");
        return;
      }

      const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
      router.push(callbackUrl);
      router.refresh();
    } catch {
      addToast("Erro ao fazer login", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-3">
          <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center">
            <Scissors className="h-6 w-6 text-white" />
          </div>
        </div>
        <CardTitle className="text-xl">Entrar</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="******"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Entrar"}
          </Button>
        </form>

        <p className="text-center text-sm text-neutral-500 mt-6">
          Não tem conta?{" "}
          <Link href="/register" className="text-red-600 font-medium hover:text-red-700 underline">
            Cadastre-se
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-center py-8 text-neutral-400">Carregando...</div>}>
      <LoginForm />
    </Suspense>
  );
}
