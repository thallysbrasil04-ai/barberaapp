"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPhone } from "@/lib/utils";
import { Clock } from "lucide-react";
import type { BarberUser } from "@/types/barbers";

export function BarberCard({
  barber, onHours, onToggle,
}: {
  barber: BarberUser;
  onHours: () => void;
  onToggle: () => void;
}) {
  return (
    <div className="p-4 border rounded-lg space-y-2">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="font-semibold text-neutral-900">{barber.name}</p>
          <p className="text-sm text-neutral-500 truncate">{barber.email}</p>
          <p className="text-sm text-neutral-500">{formatPhone(barber.phone)}</p>
        </div>
        <Badge variant={barber.active ? "success" : "danger"}>
          {barber.active ? "Ativo" : "Inativo"}
        </Badge>
      </div>
      {barber.barber?.bio && (
        <p className="text-sm text-neutral-600">{barber.barber.bio}</p>
      )}
      {barber.barber?.specialties && (
        <span className="text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded font-medium inline-block">
          {barber.barber.specialties}
        </span>
      )}
      <div className="flex gap-2 pt-1">
        <Button variant="outline" size="sm" className="flex-1" onClick={onHours}>
          <Clock className="h-3.5 w-3.5" /> Horários
        </Button>
        <Button variant="ghost" size="sm" onClick={onToggle}>
          {barber.active ? "Desativar" : "Ativar"}
        </Button>
      </div>
    </div>
  );
}
