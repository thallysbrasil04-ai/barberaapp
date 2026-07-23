import { Resend } from "resend";
import { APP_NAME } from "@/constants";

const resendApiKey = process.env.RESEND_API_KEY;
const resendFrom = process.env.RESEND_FROM || "noreply@exemplo.com";
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export const isEmailConfigured = !!resend;

export async function sendPasswordResetEmail(email: string, token: string): Promise<boolean> {
  const resetUrl = `${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/reset-password?token=${token}`;

  if (!resend) {
    console.log(`[EMAIL DISABLED] Token de recuperação para ${email}: ${token}`);
    console.log(`[EMAIL DISABLED] Link: ${resetUrl}`);
    return true;
  }

  try {
    await resend.emails.send({
      from: resendFrom,
      to: email,
      subject: `Recuperação de Senha - ${APP_NAME}`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
          <h2>Recuperação de Senha</h2>
          <p>Você solicitou a redefinição de senha da sua conta no ${APP_NAME}.</p>
          <p>Clique no link abaixo para redefinir sua senha (válido por 1 hora):</p>
          <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#dc2626;color:#fff;text-decoration:none;border-radius:8px;">
            Redefinir Senha
          </a>
          <p style="color:#666;font-size:12px;margin-top:24px;">Se você não solicitou esta recuperação, ignore este e-mail.</p>
        </div>
      `,
    });
    return true;
  } catch (err) {
    console.error("Erro ao enviar email:", err);
    return false;
  }
}
