"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { formatDate, formatPhone } from "@/lib/utils";
import { APPOINTMENT_STYLES, APPOINTMENT_LABELS } from "@/constants";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useToastContext } from "@/providers/toast-provider";
import { Search, XCircle, AlertTriangle, Calendar } from "lucide-react";
import Link from "next/link";

interface Appointment {
  id: string;
  date: string;
  time: string;
  status: string;
  notes: string | null;
  user: { id: string; name: string; phone: string };
  barber: { id: string; user: { name: string } };
  service: { id: string; name: string; price: number; duration: number };
}

export default function AgendaPage() {
  const { addToast } = useToastContext();
  const user = useCurrentUser();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchDate, setSearchDate] = useState(new Date().toISOString().split("T")[0]);

  const isClient = user?.role === "CLIENT";
  const [cancelTarget, setCancelTarget] = useState<string | null>(null);
  const [error, setError] = useState(false);

  function loadAppointments(date: string) {
    setLoading(true);
    setError(false);
    fetch(`/api/appointments?date=${date}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) setAppointments(data.data.appointments);
        else setError(true);
      })
      .catch(() => { setError(true); addToast("Erro ao carregar agendamentos", "error"); })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadAppointments(searchDate);
  }, [searchDate]);

  async function handleCancel(id: string) {
    setCancelTarget(null);
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELADO" }),
      });
      const data = await res.json();
      if (data.ok) {
        addToast("Agendamento cancelado!", "success");
        loadAppointments(searchDate);
      } else {
        addToast(data.error || "Erro ao cancelar", "error");
      }
    } catch {
      addToast("Erro de conexão", "error");
    }
  }

  async function handleStatusChange(id: string, status: string) {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.ok) {
        addToast("Status atualizado!", "success");
        loadAppointments(searchDate);
      } else {
        addToast(data.error || "Erro ao atualizar", "error");
      }
    } catch {
      addToast("Erro de conexão", "error");
    }
  }

  return (
    <div className="space-y-6">
      {isClient && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <p className="text-sm text-blue-800">
            Acompanhe seus agendamentos ou cancele se precisar.
          </p>
          <Link href="/agendamento">
            <Button size="sm">Agendar Novo</Button>
          </Link>
        </div>
      )}

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input
            type="date"
            value={searchDate}
            onChange={(e) => setSearchDate(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSearchDate(new Date().toISOString().split("T")[0])}
        >
          Hoje
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {isClient
              ? "Meus Agendamentos"
              : user?.role === "BARBER"
                ? `Minha Agenda - ${formatDate(searchDate)}`
                : `Agendamentos de ${formatDate(searchDate)}`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="animate-pulse text-neutral-400 text-center py-8">Carregando...</div>
          ) : error ? (
            <div className="text-center py-8">
              <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
              <p className="text-neutral-500">Erro ao carregar agendamentos</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={() => loadAppointments(searchDate)}>
                Tentar Novamente
              </Button>
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-8 w-8 text-neutral-300 mx-auto mb-2" />
              <p className="text-neutral-500 mb-4">Nenhum agendamento para esta data</p>
              {isClient && (
                <Link href="/agendamento">
                  <Button>Agendar Horário</Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {appointments.map((apt) => (
                <div key={apt.id} className="flex flex-wrap items-center justify-between gap-4 border-b pb-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">
                      {apt.time} {user?.role !== "BARBER" && !isClient && `- ${apt.user.name}`}
                    </p>
                    <p className="text-sm text-neutral-500">
                      {apt.service.name}
                      {user?.role !== "BARBER" && !isClient && ` com ${apt.barber.user.name}`}
                      {isClient && ` - ${apt.barber.user.name}`}
                    </p>
                    {!isClient && (
                      <p className="text-xs text-neutral-400">{formatPhone(apt.user.phone)}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      style={{
                        backgroundColor: APPOINTMENT_STYLES[apt.status]?.bg,
                        color: APPOINTMENT_STYLES[apt.status]?.text,
                        borderColor: APPOINTMENT_STYLES[apt.status]?.border,
                      }}
                    >
                      {APPOINTMENT_LABELS[apt.status]}
                    </Badge>
                    {isClient && apt.status === "AGENDADO" && (
                      <button
                        onClick={() => setCancelTarget(apt.id)}
                        className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1 cursor-pointer"
                      >
                        <XCircle className="h-4 w-4" />
                        Cancelar
                      </button>
                    )}
                    {!isClient && (
                      <select
                        value={apt.status}
                        onChange={(e) => handleStatusChange(apt.id, e.target.value)}
                        className={`text-xs border rounded px-2 py-1 ${user?.role === "BARBER" ? "border-blue-300 bg-blue-50" : ""}`}
                      >
                        {Object.entries(APPOINTMENT_LABELS).map(([key, label]) => (
                          <option key={key} value={key}>
                            {label}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <Dialog open={!!cancelTarget} onOpenChange={(open) => !open && setCancelTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar Agendamento</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja cancelar este agendamento? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setCancelTarget(null)}>
              Manter Agendamento
            </Button>
            <Button variant="destructive" onClick={() => cancelTarget && handleCancel(cancelTarget)}>
              Sim, Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
