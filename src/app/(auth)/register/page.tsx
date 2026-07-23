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
    <div className="min-h-screen bg-stone-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(217,119,70,0.08)_0%,transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(217,119,70,0.05)_0%,transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

      <div className="w-full max-w-lg relative z-10">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
            <Scissors className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Barber<span className="text-primary">App</span>
          </h1>
          <p className="text-stone-500 text-sm mt-1">Crie sua conta</p>
        </div>

        <Card className="w-full border-stone-800 bg-stone-900/80 backdrop-blur-sm shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-lg text-white">Criar Conta</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-stone-300">Nome</Label>
                <Input
                  id="name"
                  placeholder="Seu nome"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="bg-stone-800/50 border-stone-700 text-white placeholder:text-stone-500 focus:border-primary"
                />
                {errors.name && <p className="text-sm text-red-400 mt-1">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-stone-300">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="bg-stone-800/50 border-stone-700 text-white placeholder:text-stone-500 focus:border-primary"
                />
                {errors.email && <p className="text-sm text-red-400 mt-1">{errors.email}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-stone-300">Telefone</Label>
                  <Input
                    id="phone"
                    placeholder="(11) 99999-9999"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="bg-stone-800/50 border-stone-700 text-white placeholder:text-stone-500 focus:border-primary"
                  />
                  {errors.phone && <p className="text-sm text-red-400 mt-1">{errors.phone}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cpf" className="text-stone-300">CPF (opcional)</Label>
                  <Input
                    id="cpf"
                    placeholder="000.000.000-00"
                    value={form.cpf}
                    onChange={(e) => setForm({ ...form, cpf: e.target.value })}
                    className="bg-stone-800/50 border-stone-700 text-white placeholder:text-stone-500 focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-stone-300">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="******"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="bg-stone-800/50 border-stone-700 text-white placeholder:text-stone-500 focus:border-primary"
                  />
                  {errors.password && <p className="text-sm text-red-400 mt-1">{errors.password}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-stone-300">Confirmar Senha</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="******"
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    className="bg-stone-800/50 border-stone-700 text-white placeholder:text-stone-500 focus:border-primary"
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-400 mt-1">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-stone-800/50 border border-stone-700 rounded-lg">
                <input
                  type="checkbox"
                  id="consentLGPD"
                  checked={form.consentLGPD}
                  onChange={(e) => setForm({ ...form, consentLGPD: e.target.checked })}
                  className="mt-1 accent-primary"
                />
                <Label htmlFor="consentLGPD" className="text-sm font-normal text-stone-400">
                  Concordo com a{" "}
                  <Link href="/privacidade" className="text-primary underline underline-offset-2">
                    Política de Privacidade
                  </Link>{" "}
                  e autorizo o uso dos meus dados conforme a LGPD
                </Label>
              </div>
              {errors.consentLGPD && <p className="text-sm text-red-400">{errors.consentLGPD}</p>}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Criar Conta"}
              </Button>
            </form>

            <p className="text-center text-sm text-stone-500 mt-6">
              Já tem conta?{" "}
              <Link href="/login" className="text-primary font-medium hover:text-primary-dark underline underline-offset-2">
                Entrar
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
