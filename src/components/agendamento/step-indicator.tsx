"use client";

import { CheckCircle } from "lucide-react";

const steps = [
  { key: "service", label: "Serviço" },
  { key: "barber", label: "Barbeiro" },
  { key: "datetime", label: "Data" },
  { key: "confirm", label: "Confirmar" },
];

const stepKeys = steps.map((s) => s.key);

export function StepIndicator({ current }: { current: string }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {steps.map((s, i) => {
        const isCompleted = stepKeys.indexOf(s.key) < stepKeys.indexOf(current);
        const isActive = s.key === current;
        return (
          <div key={s.key} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-xs md:text-sm font-bold transition-all duration-300 ${
                  isActive
                    ? "bg-red-600 text-white shadow-lg shadow-red-200 scale-110"
                    : isCompleted
                      ? "bg-neutral-800 text-white"
                      : "bg-neutral-200 text-neutral-400"
                }`}
              >
                {isCompleted ? <CheckCircle className="h-4 w-4 md:h-5 md:w-5" /> : i + 1}
              </div>
              <span
                className={`text-[10px] md:text-xs font-medium transition-colors hidden md:block ${
                  isActive ? "text-red-600" : isCompleted ? "text-neutral-800" : "text-neutral-400"
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`w-8 md:w-16 h-0.5 mx-1 md:mx-2 rounded transition-colors duration-300 ${
                  isCompleted ? "bg-neutral-800" : "bg-neutral-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
