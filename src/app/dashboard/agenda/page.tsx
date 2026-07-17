"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatDate, formatPhone } from "@/lib/utils";
import { APPOINTMENT_COLORS, APPOINTMENT_LABELS } from "@/constants";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useToastContext } from "@/providers/toast-provider";
import { Search, XCircle } from "lucide-react";
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

  function loadAppointments(date: string) {
    setLoading(true);
    fetch(`/api/appointments?date=${date}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) setAppointments(data.data.appointments);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadAppointments(searchDate);
  }, [searchDate]);

  async function handleCancel(id: string) {
    if (!confirm("Tem certeza que deseja cancelar este agendamento?")) return;
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
      addToast("Erro ao cancelar", "error");
    }
  }

  async function handleStatusChange(id: string, status: string) {
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
      addToast("Erro ao atualizar", "error");
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

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input
            type="date"
            value={searchDate}
            onChange={(e) => setSearchDate(e.target.value)}
            className="pl-10"
          />
        </div>
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
          ) : appointments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-neutral-500 mb-4">Nenhum agendamento encontrado</p>
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
                    <Badge className={APPOINTMENT_COLORS[apt.status]}>
                      {APPOINTMENT_LABELS[apt.status]}
                    </Badge>
                    {isClient && apt.status === "AGENDADO" && (
                      <button
                        onClick={() => handleCancel(apt.id)}
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
    </div>
  );
}
