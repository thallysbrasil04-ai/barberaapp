"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
import { formatPhone } from "@/lib/utils";
import { WEEKDAYS } from "@/constants";
import { barberSchema } from "@/validators";
import { Plus, Loader2, Clock, Ban, Trash2 } from "lucide-react";

interface BarberUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string | null;
  active: boolean;
  barber: {
    id: string;
    bio: string | null;
    specialties: string | null;
    active: boolean;
    workingHours: Array<{ dayOfWeek: number; startTime: string; endTime: string; breakStart: string | null; breakEnd: string | null; active: boolean }>;
  } | null;
}

interface WorkingHour {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  breakStart: string;
  breakEnd: string;
  active: boolean;
}

interface BlockedDate {
  id: string;
  date: string;
  reason: string | null;
}

export default function BarbeirosPage() {
  const { addToast } = useToastContext();
  const [barbers, setBarbers] = useState<BarberUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [hoursOpen, setHoursOpen] = useState<BarberUser | null>(null);
  const [hoursTab, setHoursTab] = useState<"hours" | "blocked">("hours");
  const [hours, setHours] = useState<WorkingHour[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [savingHours, setSavingHours] = useState(false);
  const [newBlocked, setNewBlocked] = useState({ date: "", reason: "" });
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", bio: "", specialties: "" });

  function load() {
    fetch("/api/barbers")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) setBarbers(data.data);
      })
      .catch(() => addToast("Erro ao carregar barbeiros", "error"))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function openHours(barber: BarberUser) {
    setHoursOpen(barber);
    setHoursTab("hours");
    setNewBlocked({ date: "", reason: "" });

    try {
      const [hoursRes, blockedRes] = await Promise.all([
        fetch(`/api/barbers/${barber.barber?.id}/hours`),
        fetch(`/api/barbers/${barber.barber?.id}/blocked-dates`),
      ]);
      const hoursData = await hoursRes.json();
      const blockedData = await blockedRes.json();

      if (hoursData.ok) {
        if (hoursData.data.length > 0) {
          setHours(hoursData.data.map((h: WorkingHour & { id: string }) => ({
            dayOfWeek: h.dayOfWeek,
            startTime: h.startTime,
            endTime: h.endTime,
            breakStart: h.breakStart || "",
            breakEnd: h.breakEnd || "",
            active: h.active,
          })));
        } else {
          setHours(Array.from({ length: 7 }, (_, i) => ({
            dayOfWeek: i,
            startTime: "09:00",
            endTime: "18:00",
            breakStart: "12:00",
            breakEnd: "13:00",
            active: i !== 0,
          })));
        }
      }
      if (blockedData.ok) setBlockedDates(blockedData.data);
    } catch {
      addToast("Erro ao carregar horários", "error");
    }
  }

  async function saveHours() {
    if (!hoursOpen?.barber) return;
    setSavingHours(true);

    const res = await fetch(`/api/barbers/${hoursOpen.barber.id}/hours`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(hours),
    });

    const data = await res.json();
    if (data.ok) {
      addToast("Horários salvos com sucesso!", "success");
    } else {
      addToast("Erro ao salvar horários", "error");
    }
    setSavingHours(false);
  }

  async function addBlockedDate() {
    if (!hoursOpen?.barber || !newBlocked.date) return;

    const res = await fetch(`/api/barbers/${hoursOpen.barber.id}/blocked-dates`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newBlocked),
    });

    const data = await res.json();
    if (data.ok) {
      setBlockedDates([...blockedDates, data.data]);
      setNewBlocked({ date: "", reason: "" });
      addToast("Data bloqueada!", "success");
    } else {
      addToast(data.error || "Erro ao bloquear data", "error");
    }
  }

  async function removeBlockedDate(dateId: string) {
    if (!hoursOpen?.barber) return;

    const res = await fetch(`/api/barbers/${hoursOpen.barber.id}/blocked-dates/${dateId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setBlockedDates(blockedDates.filter((d) => d.id !== dateId));
      addToast("Data desbloqueada!", "success");
    }
  }

  function updateHour(day: number, field: keyof WorkingHour, value: string | boolean) {
    setHours(hours.map((h) => (h.dayOfWeek === day ? { ...h, [field]: value } : h)));
  }

  async function handleCreate() {
    const parsed = barberSchema.safeParse(form);
    if (!parsed.success) {
      addToast(parsed.error.issues[0].message, "error");
      return;
    }

    try {
      const res = await fetch("/api/barbers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = await res.json();
      if (data.ok) {
        addToast("Barbeiro cadastrado!", "success");
        setCreateOpen(false);
        setForm({ name: "", email: "", phone: "", password: "", bio: "", specialties: "" });
        load();
      } else {
        addToast(data.error || "Erro ao cadastrar", "error");
      }
    } catch {
      addToast("Erro de conexão", "error");
    }
  }

  async function toggleActive(userId: string, current: boolean) {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !current }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setBarbers(barbers.map((b) => (b.id === userId ? { ...b, active: !current } : b)));
        addToast("Status atualizado!", "success");
      } else {
        addToast(data?.error || "Erro ao atualizar", "error");
      }
    } catch {
      addToast("Erro de conexão", "error");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Barbeiros ({barbers.length})</h2>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          Novo Barbeiro
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {loading ? (
          <div className="col-span-full flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
          </div>
        ) : barbers.length === 0 ? (
          <p className="col-span-full text-neutral-500 text-center py-8">Nenhum barbeiro cadastrado</p>
        ) : (
          barbers.map((barber) => (
            <Card key={barber.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold">{barber.name}</h3>
                    <p className="text-xs text-neutral-500">{barber.email}</p>
                    <p className="text-xs text-neutral-500">{formatPhone(barber.phone)}</p>
                  </div>
                  <Badge variant={barber.active ? "success" : "danger"}>
                    {barber.active ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
                {barber.barber?.bio && (
                  <p className="text-sm text-neutral-600 mb-1">{barber.barber.bio}</p>
                )}
                {barber.barber?.specialties && (
                  <p className="text-xs text-neutral-400">Especialidades: {barber.barber.specialties}</p>
                )}
                <div className="flex gap-2 mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openHours(barber)}
                  >
                    <Clock className="h-3 w-3" />
                    Horários
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => toggleActive(barber.id, barber.active)}>
                    {barber.active ? "Desativar" : "Ativar"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Horários Dialog */}
      <Dialog open={!!hoursOpen} onOpenChange={(open) => !open && setHoursOpen(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Horários - {hoursOpen?.name}</DialogTitle>
            <DialogDescription>Configure os horários de funcionamento e feriados</DialogDescription>
          </DialogHeader>

          <div className="flex gap-2 border-b pb-2">
            <button
              onClick={() => setHoursTab("hours")}
              className={`px-3 py-1 text-sm rounded-t cursor-pointer ${hoursTab === "hours" ? "bg-neutral-900 text-white" : "text-neutral-500 hover:text-neutral-900"}`}
            >
              <Clock className="h-3 w-3 inline mr-1" />
              Funcionamento
            </button>
            <button
              onClick={() => setHoursTab("blocked")}
              className={`px-3 py-1 text-sm rounded-t cursor-pointer ${hoursTab === "blocked" ? "bg-neutral-900 text-white" : "text-neutral-500 hover:text-neutral-900"}`}
            >
              <Ban className="h-3 w-3 inline mr-1" />
              Feriados
            </button>
          </div>

          {hoursTab === "hours" && (
            <div className="space-y-3 max-h-96 overflow-auto">
              {hours.map((h) => (
                <div key={h.dayOfWeek} className="flex items-center gap-3 p-2 border rounded-md">
                  <div className="flex items-center gap-2 w-24">
                    <input
                      type="checkbox"
                      checked={h.active}
                      onChange={(e) => updateHour(h.dayOfWeek, "active", e.target.checked)}
                      className="cursor-pointer"
                    />
                    <span className={`text-sm font-medium ${!h.active ? "text-neutral-400" : ""}`}>
                      {WEEKDAYS[h.dayOfWeek]}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 flex-1 flex-wrap">
                    <Input
                      type="time"
                      value={h.startTime}
                      onChange={(e) => updateHour(h.dayOfWeek, "startTime", e.target.value)}
                      className="w-24 h-8 text-xs"
                      disabled={!h.active}
                    />
                    <span className="text-xs text-neutral-400">às</span>
                    <Input
                      type="time"
                      value={h.endTime}
                      onChange={(e) => updateHour(h.dayOfWeek, "endTime", e.target.value)}
                      className="w-24 h-8 text-xs"
                      disabled={!h.active}
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-neutral-400">Almoço:</span>
                    <Input
                      type="time"
                      value={h.breakStart}
                      onChange={(e) => updateHour(h.dayOfWeek, "breakStart", e.target.value)}
                      className="w-20 h-8 text-xs"
                      disabled={!h.active}
                    />
                    <span className="text-xs text-neutral-400">-</span>
                    <Input
                      type="time"
                      value={h.breakEnd}
                      onChange={(e) => updateHour(h.dayOfWeek, "breakEnd", e.target.value)}
                      className="w-20 h-8 text-xs"
                      disabled={!h.active}
                    />
                  </div>
                </div>
              ))}

              <Button className="w-full" onClick={saveHours} disabled={savingHours}>
                {savingHours ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar Horários"}
              </Button>
            </div>
          )}

          {hoursTab === "blocked" && (
            <div className="space-y-4">
              <div className="flex items-end gap-2">
                <div className="flex-1 space-y-1">
                  <Label className="text-xs">Data</Label>
                  <Input
                    type="date"
                    value={newBlocked.date}
                    onChange={(e) => setNewBlocked({ ...newBlocked, date: e.target.value })}
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <Label className="text-xs">Motivo (opcional)</Label>
                  <Input
                    placeholder="Ex: Feriado, Folga..."
                    value={newBlocked.reason}
                    onChange={(e) => setNewBlocked({ ...newBlocked, reason: e.target.value })}
                  />
                </div>
                <Button size="sm" onClick={addBlockedDate}>
                  <Plus className="h-3 w-3" />
                </Button>
              </div>

              <div className="space-y-2 max-h-48 overflow-auto">
                {blockedDates.length === 0 ? (
                  <p className="text-sm text-neutral-400 text-center py-4">Nenhuma data bloqueada</p>
                ) : (
                  blockedDates.map((bd) => (
                    <div key={bd.id} className="flex items-center justify-between border rounded-md p-2">
                      <div>
                        <span className="text-sm font-medium">
                          {new Date(bd.date + "T12:00:00").toLocaleDateString("pt-BR")}
                        </span>
                        {bd.reason && (
                          <span className="text-xs text-neutral-500 ml-2">- {bd.reason}</span>
                        )}
                      </div>
                      <button
                        onClick={() => removeBlockedDate(bd.id)}
                        className="text-red-500 hover:text-red-700 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Barbeiro</DialogTitle>
            <DialogDescription>Cadastre um novo barbeiro no sistema</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Senha</Label>
              <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Bio</Label>
              <Input value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Especialidades</Label>
              <Input value={form.specialties} onChange={(e) => setForm({ ...form, specialties: e.target.value })} />
            </div>
            <Button className="w-full" onClick={handleCreate}>Cadastrar Barbeiro</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
