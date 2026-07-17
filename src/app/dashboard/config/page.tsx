"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToastContext } from "@/providers/toast-provider";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";

export default function ConfigPage() {
  const { addToast } = useToastContext();
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function requestDataDeletion() {
    if (!confirm("Tem certeza? Seus dados serão anonimizados e você será desconectado.")) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/users/delete-account", { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        addToast("Dados anonimizados com sucesso!", "success");
        await signOut({ callbackUrl: "/" });
      } else {
        addToast(data.error || "Erro ao anonimizar dados", "error");
      }
    } catch {
      addToast("Erro ao anonimizar dados", "error");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6 max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle>Configurações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium mb-1">LGPD - Privacidade</h3>
            <p className="text-sm text-neutral-500 mb-2">
              Você pode solicitar a exclusão dos seus dados pessoais do sistema.
              Dados de agendamentos serão anonimizados.
            </p>
            <Button variant="outline" onClick={requestDataDeletion} disabled={deleting}>
              {deleting ? "Anonimizando..." : "Solicitar Exclusão de Dados"}
            </Button>
          </div>

          <hr />

          <div>
            <h3 className="font-medium mb-1">Sessão</h3>
            <Button
              variant="destructive"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              Sair da Conta
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
