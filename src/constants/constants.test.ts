import { describe, it, expect } from "vitest";
import {
  ROLES,
  ROLE_LABELS,
  APPOINTMENT_STATUS,
  APPOINTMENT_LABELS,
  APPOINTMENT_STYLES,
  WEEKDAYS,
  SERVICE_CATEGORIES,
  TIME_SLOTS,
  APP_NAME,
  APP_DESCRIPTION,
} from "@/constants";

describe("ROLES", () => {
  it("has all roles", () => {
    expect(ROLES.ADMIN).toBe("ADMIN");
    expect(ROLES.BARBER).toBe("BARBER");
    expect(ROLES.CLIENT).toBe("CLIENT");
  });
});

describe("ROLE_LABELS", () => {
  it("has Portuguese labels for all roles", () => {
    expect(ROLE_LABELS.ADMIN).toBe("Administrador");
    expect(ROLE_LABELS.BARBER).toBe("Barbeiro");
    expect(ROLE_LABELS.CLIENT).toBe("Cliente");
  });
});

describe("APPOINTMENT_STATUS", () => {
  it("has all statuses", () => {
    expect(APPOINTMENT_STATUS.AGENDADO).toBe("AGENDADO");
    expect(APPOINTMENT_STATUS.CONFIRMADO).toBe("CONFIRMADO");
    expect(APPOINTMENT_STATUS.EM_ANDAMENTO).toBe("EM_ANDAMENTO");
    expect(APPOINTMENT_STATUS.FINALIZADO).toBe("FINALIZADO");
    expect(APPOINTMENT_STATUS.CANCELADO).toBe("CANCELADO");
    expect(APPOINTMENT_STATUS.NAO_COMPARECEU).toBe("NAO_COMPARECEU");
  });
});

describe("APPOINTMENT_LABELS", () => {
  it("has labels for all statuses", () => {
    for (const status of Object.values(APPOINTMENT_STATUS)) {
      expect(APPOINTMENT_LABELS[status]).toBeDefined();
      expect(typeof APPOINTMENT_LABELS[status]).toBe("string");
    }
  });
});

describe("APPOINTMENT_STYLES", () => {
  it("has styles for all statuses", () => {
    for (const status of Object.values(APPOINTMENT_STATUS)) {
      const style = APPOINTMENT_STYLES[status];
      expect(style).toBeDefined();
      expect(style.bg).toBeDefined();
      expect(style.text).toBeDefined();
      expect(style.border).toBeDefined();
    }
  });
});

describe("WEEKDAYS", () => {
  it("has 7 days in Portuguese", () => {
    expect(WEEKDAYS).toHaveLength(7);
    expect(WEEKDAYS[0]).toBe("Domingo");
    expect(WEEKDAYS[1]).toBe("Segunda");
    expect(WEEKDAYS[6]).toBe("Sábado");
  });
});

describe("SERVICE_CATEGORIES", () => {
  it("includes common categories", () => {
    expect(SERVICE_CATEGORIES).toContain("CORTE");
    expect(SERVICE_CATEGORIES).toContain("BARBA");
    expect(SERVICE_CATEGORIES).toContain("COMBO");
  });
});

describe("TIME_SLOTS", () => {
  it("generates 30-minute intervals from 08:00 to 18:30", () => {
    expect(TIME_SLOTS[0]).toBe("08:00");
    expect(TIME_SLOTS[1]).toBe("08:30");
    expect(TIME_SLOTS).toContain("12:00");
    expect(TIME_SLOTS).toContain("18:00");
    expect(TIME_SLOTS).not.toContain("19:00");
  });
});

describe("App constants", () => {
  it("has app name and description", () => {
    expect(APP_NAME).toBe("BarberApp");
    expect(APP_DESCRIPTION).toBeTruthy();
  });
});
