"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { BlockedDate } from "@/types/barbers";

export function BlockedDatesEditor({
  dates, newDate, newReason, onNewDateChange, onNewReasonChange, onAdd, onRemove,
}: {
  dates: BlockedDate[];
  newDate: string;
  newReason: string;
  onNewDateChange: (date: string) => void;
  onNewReasonChange: (reason: string) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-end">
        <div className="space-y-1">
          <Label className="text-xs">Data</Label>
          <Input type="date" value={newDate} onChange={(e) => onNewDateChange(e.target.value)}
            className="w-40 h-8 text-sm" />
        </div>
        <div className="space-y-1 flex-1">
          <Label className="text-xs">Motivo (opcional)</Label>
          <Input value={newReason} onChange={(e) => onNewReasonChange(e.target.value)}
            placeholder="Ex: Feriado" className="h-8 text-sm" />
        </div>
        <Button size="sm" onClick={onAdd} disabled={!newDate}>Adicionar</Button>
      </div>

      <div className="space-y-2 max-h-60 overflow-y-auto">
        {dates.length === 0 ? (
          <p className="text-sm text-neutral-400 text-center py-4">Nenhuma data bloqueada</p>
        ) : dates.map((b) => (
          <div key={b.id} className="flex items-center justify-between p-2.5 border rounded-lg">
            <div>
              <p className="text-sm font-medium text-neutral-900">{formatDate(b.date)}</p>
              {b.reason && <p className="text-xs text-neutral-500">{b.reason}</p>}
            </div>
            <button onClick={() => onRemove(b.id)}
              className="p-1.5 rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-600 transition-colors cursor-pointer">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
