"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToastContext } from "@/providers/toast-provider";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

export default function ConfigPage() {
  const { addToast } = useToastContext();
  const router = useRouter();

  async function requestDataDeletion() {
    if (!confirm("Tem certeza? Seus dados serão anonimizados.")) return;
    addToast("Solicitação de exclusão enviada. Seus dados serão removidos em até 15 dias.", "success");
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
            <Button variant="outline" onClick={requestDataDeletion}>
              Solicitar Exclusão de Dados
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
