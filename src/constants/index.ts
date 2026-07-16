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

export const APPOINTMENT_COLORS: Record<string, string> = {
  AGENDADO: "bg-blue-100 text-blue-800",
  CONFIRMADO: "bg-green-100 text-green-800",
  EM_ANDAMENTO: "bg-yellow-100 text-yellow-800",
  FINALIZADO: "bg-gray-100 text-gray-800",
  CANCELADO: "bg-red-100 text-red-800",
  NAO_COMPARECEU: "bg-orange-100 text-orange-800",
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
