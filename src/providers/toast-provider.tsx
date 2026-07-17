"use client";

import { createContext, useContext, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface ToastContextType {
  addToast: (message: string, variant?: "default" | "success" | "error") => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const { toasts, addToast, removeToast } = useToast();

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-3 text-sm shadow-lg animate-in slide-in-from-right",
              toast.variant === "success" && "bg-neutral-800 text-white border border-neutral-700",
              toast.variant === "error" && "bg-red-600 text-white",
              toast.variant === "default" && "bg-neutral-900 text-white"
            )}
          >
            <span className="flex-1">{toast.message}</span>
            <button onClick={() => removeToast(toast.id)} className="cursor-pointer" aria-label="Fechar notificação">
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToastContext must be used within ToastProvider");
  return context;
}
