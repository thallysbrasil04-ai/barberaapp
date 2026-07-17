export const ROLES = {
  ADMIN: "ADMIN" as const,
  BARBER: "BARBER" as const,
  CLIENT: "CLIENT" as const,
};

export const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrador",
  BARBER: "Barbeiro",
  CLIENT: "Cliente",
};

export const APPOINTMENT_STATUS = {
  AGENDADO: "AGENDADO",
  CONFIRMADO: "CONFIRMADO",
  EM_ANDAMENTO: "EM_ANDAMENTO",
  FINALIZADO: "FINALIZADO",
  CANCELADO: "CANCELADO",
  NAO_COMPARECEU: "NAO_COMPARECEU",
} as const;

export const APPOINTMENT_LABELS: Record<string, string> = {
  AGENDADO: "Agendado",
  CONFIRMADO: "Confirmado",
  EM_ANDAMENTO: "Em Andamento",
  FINALIZADO: "Finalizado",
  CANCELADO: "Cancelado",
  NAO_COMPARECEU: "Não Compareceu",
};

export const APPOINTMENT_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  AGENDADO: { bg: "#DBEAFE", text: "#1E40AF", border: "#93C5FD" },
  CONFIRMADO: { bg: "#DCFCE7", text: "#166534", border: "#86EFAC" },
  EM_ANDAMENTO: { bg: "#FEF9C3", text: "#854D0E", border: "#FDE68A" },
  FINALIZADO: { bg: "#F3F4F6", text: "#374151", border: "#D1D5DB" },
  CANCELADO: { bg: "#FEE2E2", text: "#991B1B", border: "#FCA5A5" },
  NAO_COMPARECEU: { bg: "#FFEDD5", text: "#9A3412", border: "#FDBA74" },
};

export const WEEKDAYS = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];

export const SERVICE_CATEGORIES = [
  "CORTE",
  "BARBA",
  "HIDRATAÇÃO",
  "SOBRANCELHA",
  "COMBO",
  "OUTROS",
];

export const TIME_SLOTS = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2) + 8;
  const minute = i % 2 === 0 ? "00" : "30";
  return `${String(hour).padStart(2, "0")}:${minute}`;
}).filter((t) => {
  const h = parseInt(t.split(":")[0]);
  return h >= 8 && h < 19;
});

export const APP_NAME = "BarberApp";
export const APP_DESCRIPTION = "Sistema de agendamento para barbearias";
