"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WEEKDAYS } from "@/constants";
import type { WorkingHour } from "@/types/barbers";

export function WorkingHoursEditor({
  hours, onUpdate, saving,
}: {
  hours: WorkingHour[];
  onUpdate: (index: number, field: keyof WorkingHour, value: string | boolean) => void;
  saving: boolean;
}) {
  return (
    <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
      {hours.map((h, i) => (
        <div key={i} className="flex items-start gap-2 p-3 border rounded-lg">
          <div className="pt-1.5">
            <input type="checkbox" checked={h.active}
              onChange={(e) => onUpdate(i, "active", e.target.checked)}
              className="h-4 w-4 rounded border-neutral-300 text-red-600 focus:ring-red-500 cursor-pointer" />
          </div>
          <div className="flex-1 space-y-1.5">
            <Label className="text-sm font-medium">{WEEKDAYS[h.dayOfWeek]}</Label>
            <div className="flex items-center gap-2 flex-wrap">
              <Input type="time" value={h.startTime}
                onChange={(e) => onUpdate(i, "startTime", e.target.value)}
                disabled={!h.active} className="w-28 h-8 text-xs" />
              <span className="text-xs text-neutral-400">às</span>
              <Input type="time" value={h.endTime}
                onChange={(e) => onUpdate(i, "endTime", e.target.value)}
                disabled={!h.active} className="w-28 h-8 text-xs" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-400">Almoço:</span>
              <Input type="time" value={h.breakStart || ""}
                onChange={(e) => onUpdate(i, "breakStart", e.target.value || "")}
                disabled={!h.active} className="w-24 h-7 text-xs" />
              <span className="text-xs text-neutral-400">-</span>
              <Input type="time" value={h.breakEnd || ""}
                onChange={(e) => onUpdate(i, "breakEnd", e.target.value || "")}
                disabled={!h.active} className="w-24 h-7 text-xs" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
