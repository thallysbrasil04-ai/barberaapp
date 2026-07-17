"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToastContext } from "@/providers/toast-provider";
import { formatCurrency, formatPhone } from "@/lib/utils";
import { Plus, Loader2 } from "lucide-react";

interface Service {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration: number;
  category: string;
  active: boolean;
}

export default function ServicosPage() {
  const { addToast } = useToastContext();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState({ name: "", description: "", price: "", duration: "", category: "CORTE" });

  function loadServices() {
    fetch("/api/services")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) setServices(data.data);
      })
      .catch(() => addToast("Erro ao carregar serviços", "error"))
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadServices(); }, []);

  function openNew() {
    setEditing(null);
    setForm({ name: "", description: "", price: "", duration: "", category: "CORTE" });
    setDialogOpen(true);
  }

  function openEdit(service: Service) {
    setEditing(service);
    setForm({
      name: service.name,
      description: service.description || "",
      price: String(service.price),
      duration: String(service.duration),
      category: service.category,
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.name.trim()) {
      addToast("Nome é obrigatório", "error");
      return;
    }
    const price = parseFloat(form.price);
    const duration = parseInt(form.duration);
    if (isNaN(price) || price <= 0) {
      addToast("Preço inválido", "error");
      return;
    }
    if (isNaN(duration) || duration <= 0) {
      addToast("Duração inválida", "error");
      return;
    }

    const url = editing ? `/api/services/${editing.id}` : "/api/services";
    const method = editing ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name.trim(),
        description: form.description || undefined,
        price,
        duration,
        category: form.category,
      }),
    });

    const data = await res.json();
    if (data.ok) {
      addToast(editing ? "Serviço atualizado!" : "Serviço criado!", "success");
      setDialogOpen(false);
      loadServices();
    } else {
      addToast(data.error || "Erro ao salvar", "error");
    }
  }

  async function toggleActive(id: string, current: boolean) {
    try {
      const res = await fetch(`/api/services/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !current }),
      });
      const data = await res.json();
      if (data.ok) {
        setServices(services.map((s) => (s.id === id ? { ...s, active: !current } : s)));
        addToast("Status atualizado!", "success");
      } else {
        addToast(data.error || "Erro ao atualizar", "error");
      }
    } catch {
      addToast("Erro de conexão", "error");
    }
  }

  const categories = ["CORTE", "BARBA", "HIDRATAÇÃO", "SOBRANCELHA", "COMBO", "OUTROS"];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Serviços ({services.length})</h2>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4" />
          Novo Serviço
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
          </div>
        ) : services.length === 0 ? (
          <p className="col-span-full text-neutral-500 text-center py-8">Nenhum serviço cadastrado</p>
        ) : (
          services.map((service) => (
            <Card key={service.id} className={service.active ? "" : "opacity-60"}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold">{service.name}</h3>
                    <p className="text-xs text-neutral-500">{service.category}</p>
                  </div>
                  <Badge variant={service.active ? "success" : "danger"}>
                    {service.active ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
                {service.description && (
                  <p className="text-sm text-neutral-600 mb-2">{service.description}</p>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold">{formatCurrency(service.price)}</span>
                  <span className="text-neutral-500">{service.duration} min</span>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(service)}>
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleActive(service.id, service.active)}
                  >
                    {service.active ? "Desativar" : "Ativar"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Serviço" : "Novo Serviço"}</DialogTitle>
            <DialogDescription>Preencha os dados do serviço</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Preço (R$)</Label>
                <Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Duração (min)</Label>
                <Input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="flex h-9 w-full rounded-md border border-neutral-300 bg-transparent px-3 py-1 text-sm"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <Button className="w-full" onClick={handleSave}>
              {editing ? "Atualizar" : "Criar Serviço"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
