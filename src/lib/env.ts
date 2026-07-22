import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url("DATABASE_URL deve ser uma URL válida"),
  AUTH_SECRET: z.string().min(16, "AUTH_SECRET deve ter pelo menos 16 caracteres"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.warn("⚠️  Variáveis de ambiente inválidas:");
  for (const issue of parsed.error.issues) {
    console.warn(`  - ${issue.path.join(".")}: ${issue.message}`);
  }
}

export const env = parsed.success ? parsed.data : { DATABASE_URL: process.env.DATABASE_URL || "", AUTH_SECRET: process.env.AUTH_SECRET || "", NODE_ENV: "development" as const };
