export interface BarberUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  active: boolean;
  barber: {
    id: string;
    bio: string | null;
    specialties: string | null;
  } | null;
}

export interface WorkingHour {
  id?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  breakStart?: string;
  breakEnd?: string;
  active: boolean;
}

export interface BlockedDate {
  id: string;
  date: string;
  reason: string | null;
}
