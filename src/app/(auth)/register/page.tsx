"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Scissors, Loader2 } from "lucide-react";
import { registerSchema } from "@/validators";
import { useToastContext } from "@/providers/toast-provider";

export default function RegisterPage() {
  const router = useRouter();
  const { addToast } = useToastContext();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    cpf: "",
    consentLGPD: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const result = registerSchema.safeParse(form);
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
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!data.ok) {
        addToast(data.error || "Erro ao cadastrar", "error");
        return;
      }

      addToast("Conta criada com sucesso!", "success");
      router.push("/login");
    } catch {
      addToast("Erro ao cadastrar", "error");
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
        <CardTitle className="text-xl">Criar Conta</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              placeholder="Seu nome"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
          </div>

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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                placeholder="(11) 99999-9999"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
              {errors.phone && <p className="text-sm text-red-600 mt-1">{errors.phone}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpf">CPF (opcional)</Label>
              <Input
                id="cpf"
                placeholder="000.000.000-00"
                value={form.cpf}
                onChange={(e) => setForm({ ...form, cpf: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="******"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-600 mt-1">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <input
              type="checkbox"
              id="consentLGPD"
              checked={form.consentLGPD}
              onChange={(e) => setForm({ ...form, consentLGPD: e.target.checked })}
              className="mt-1 accent-red-600"
            />
            <Label htmlFor="consentLGPD" className="text-sm font-normal text-neutral-700">
              Concordo com a{" "}
              <Link href="/privacidade" className="text-red-600 underline">
                Política de Privacidade
              </Link>{" "}
              e autorizo o uso dos meus dados conforme a LGPD
            </Label>
          </div>
          {errors.consentLGPD && <p className="text-sm text-red-600">{errors.consentLGPD}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Criar Conta"}
          </Button>
        </form>

        <p className="text-center text-sm text-neutral-500 mt-6">
          Já tem conta?{" "}
          <Link href="/login" className="text-red-600 font-medium hover:text-red-700 underline">
            Entrar
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
