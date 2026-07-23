export const TIME_PERIODS = [
  { label: "Manhã", start: "08:00", end: "12:00" },
  { label: "Tarde", start: "12:00", end: "18:00" },
  { label: "Noite", start: "18:00", end: "23:00" },
];

export function groupSlotsByPeriod(slots: string[]) {
  return TIME_PERIODS.map((period) => ({
    ...period,
    slots: slots.filter((t) => t >= period.start && t < period.end),
  })).filter((p) => p.slots.length > 0);
}
