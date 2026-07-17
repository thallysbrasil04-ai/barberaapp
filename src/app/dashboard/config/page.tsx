"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToastContext } from "@/providers/toast-provider";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { AlertTriangle, LogOut } from "lucide-react";

export default function ConfigPage() {
  const { addToast } = useToastContext();
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function handleDelete() {
    setConfirmDelete(false);
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
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-1">LGPD - Privacidade</h3>
            <p className="text-sm text-neutral-500 mb-2">
              Você pode solicitar a exclusão dos seus dados pessoais do sistema.
              Dados de agendamentos serão anonimizados.
            </p>
            <Button variant="outline" onClick={() => setConfirmDelete(true)} disabled={deleting}>
              {deleting ? "Anonimizando..." : "Excluir Meus Dados"}
            </Button>
          </div>

          <hr />

          <div>
            <h3 className="font-medium mb-1">Sessão</h3>
            <Button
              variant="destructive"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              <LogOut className="h-4 w-4" />
              Sair da Conta
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Excluir Dados
            </DialogTitle>
            <DialogDescription>
              Tem certeza? Seus dados pessoais serão anonimizados permanentemente
              e você será desconectado. Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Sim, Excluir Meus Dados
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
