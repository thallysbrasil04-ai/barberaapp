import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Mínimo de 6 caracteres"),
});

export const registerSchema = z.object({
  name: z.string().min(3, "Mínimo de 3 caracteres"),
  email: z.string().email("E-mail inválido"),
  phone: z.string().regex(/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/, "Telefone inválido"),
  password: z.string().min(6, "Mínimo de 6 caracteres"),
  confirmPassword: z.string(),
  cpf: z.string().optional(),
  consentLGPD: z.boolean().refine((v) => v === true, "É necessário concordar com a política de privacidade"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não conferem",
  path: ["confirmPassword"],
});

export const serviceSchema = z.object({
  name: z.string().min(2, "Mínimo de 2 caracteres"),
  description: z.string().optional(),
  price: z.coerce.number().positive("Preço deve ser positivo"),
  duration: z.coerce.number().int().positive("Duração deve ser positiva"),
  category: z.string().min(1, "Selecione uma categoria"),
});

export const barberSchema = z.object({
  name: z.string().min(3, "Mínimo de 3 caracteres"),
  email: z.string().email("E-mail inválido"),
  phone: z.string().regex(/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/, "Telefone inválido"),
  password: z.string().min(6, "Mínimo de 6 caracteres").optional().or(z.literal("")),
  bio: z.string().optional(),
  specialties: z.string().optional(),
});

export const appointmentSchema = z.object({
  barberId: z.string().min(1, "Selecione um barbeiro"),
  serviceId: z.string().min(1, "Selecione um serviço"),
  date: z.string().min(1, "Selecione uma data"),
  time: z.string().min(1, "Selecione um horário"),
  notes: z.string().optional(),
});

export const workingHoursSchema = z.array(z.object({
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string(),
  endTime: z.string(),
  active: z.boolean(),
}));

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ServiceInput = z.infer<typeof serviceSchema>;
export type BarberInput = z.infer<typeof barberSchema>;
export type AppointmentInput = z.infer<typeof appointmentSchema>;
