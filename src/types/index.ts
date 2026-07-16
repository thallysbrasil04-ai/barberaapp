export type Role = "ADMIN" | "BARBER" | "CLIENT";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  avatar?: string | null;
  barberId?: string | null;
}

export interface BarberWithUser {
  id: string;
  bio: string | null;
  specialties: string | null;
  active: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    avatar: string | null;
  };
  workingHours: WorkingHours[];
}

export interface WorkingHours {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  active: boolean;
}

export interface AppointmentWithRelations {
  id: string;
  date: string;
  time: string;
  status: string;
  notes: string | null;
  user: {
    id: string;
    name: string;
    phone: string;
  };
  barber: {
    id: string;
    user: {
      name: string;
    };
  };
  service: {
    id: string;
    name: string;
    price: number;
    duration: number;
  };
}

export interface ApiResponse<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
}
