"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  isBefore,
  addMonths,
  subMonths,
  parse,
} from "date-fns";
import { ptBR } from "date-fns/locale";

export function Calendar({ selectedDate, onSelect }: { selectedDate: string; onSelect: (date: string) => void }) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (selectedDate) return parse(selectedDate, "yyyy-MM-dd", new Date());
    return new Date();
  });

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentMonth]);

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const today = new Date();

  return (
    <div className="select-none">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentMonth((prev) => subMonths(prev, 1))}
          className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer text-neutral-600"
          aria-label="Mês anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="font-semibold text-neutral-900 text-sm">
          {format(currentMonth, "MMMM 'de' yyyy", { locale: ptBR })}
        </span>
        <button
          onClick={() => setCurrentMonth((prev) => addMonths(prev, 1))}
          className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer text-neutral-600"
          aria-label="Próximo mês"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-[11px] font-semibold text-neutral-400 py-1">{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const isCurrent = isSameMonth(day, currentMonth);
          const past = isBefore(day, today) && !isSameDay(day, today);
          const selected = selectedDate === dateStr;
          const dayToday = isToday(day);

          return (
            <button
              key={dateStr}
              disabled={past || !isCurrent}
              onClick={() => onSelect(dateStr)}
              className={`relative p-1.5 text-center text-sm rounded-lg transition-all cursor-pointer
                ${!isCurrent ? "text-neutral-200" : ""}
                ${past || !isCurrent ? "cursor-not-allowed opacity-40" : ""}
                ${selected
                  ? "bg-red-600 text-white shadow-md shadow-red-200 font-bold"
                  : dayToday && !selected
                    ? "bg-red-50 text-red-700 font-semibold border border-red-200"
                    : isCurrent && !past
                      ? "hover:bg-neutral-100 text-neutral-700"
                      : "text-neutral-300"
                }`}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
}
