"use client";

import type { ReactNode } from "react";

export function AnimatedStep({ step, children }: { step: string; children: ReactNode }) {
  return (
    <div key={step} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      {children}
    </div>
  );
}
