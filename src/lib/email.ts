import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<void> {
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: "Verifikasi Email - PASMADA",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #991B1B;">PASMADA - Verifikasi Email</h2>
        <p>Halo,</p>
        <p>Terima kasih telah mendaftar di PASMADA (Parsadaan Alumni SMAN Sada). Silakan klik tombol di bawah untuk memverifikasi email Anda:</p>
        <a href="${verifyUrl}" style="display: inline-block; background-color: #991B1B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
          Verifikasi Email
        </a>
        <p>Atau salin link berikut ke browser Anda:</p>
        <p style="word-break: break-all; color: #6b7280;">${verifyUrl}</p>
        <p>Link ini berlaku selama 24 jam.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="color: #9ca3af; font-size: 14px;">Jika Anda tidak mendaftar di PASMADA, abaikan email ini.</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(
  email: string,
  token: string
): Promise<void> {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: "Reset Password - PASMADA",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #991B1B;">PASMADA - Reset Password</h2>
        <p>Halo,</p>
        <p>Anda meminta reset password. Silakan klik tombol di bawah:</p>
        <a href="${resetUrl}" style="display: inline-block; background-color: #991B1B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
          Reset Password
        </a>
        <p>Link ini berlaku selama 1 jam.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="color: #9ca3af; font-size: 14px;">Jika Anda tidak meminta reset password, abaikan email ini.</p>
      </div>
    `,
  });
}
