import nodemailer from "nodemailer";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    connectionTimeout: 5000,
    greetingTimeout: 5000,
  });
}

export async function sendEmail(options: SendEmailOptions) {
  const { to, subject, html } = options;
  const transporter = createTransporter();

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      html,
    });
  } catch (error: any) {
    console.log("[SMTP Error Detail]", error.message); // ← penting
    throw error;
  }
}

export async function sendResetPasswordEmail(
  email: string,
  resetToken: string,
) {
  const frontendUrl = process.env.FRONTEND_URL!;
  const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0;padding:0;background-color:#f5f6f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f6f8;padding:32px 16px">
        <tr>
          <td align="center">
            <table width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08)">
              <tr>
                <td style="background-color:#1a2b4c;padding:32px 24px;text-align:center">
                  <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700">Reset Password</h1>
                </td>
              </tr>
              <tr>
                <td style="padding:32px 24px">
                  <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6">Halo,</p>
                  <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6">
                    Kami menerima permintaan untuk mereset password akun Anda.
                    Klik tombol di bawah ini untuk melanjutkan:
                  </p>
                  <table cellpadding="0" cellspacing="0" style="margin:24px 0">
                    <tr>
                      <td align="center">
                        <a href="${resetLink}" target="_blank" style="display:inline-block;padding:14px 32px;background-color:#1a2b4c;color:#ffffff;text-decoration:none;border-radius:8px;font-size:15px;font-weight:600;box-shadow:0 2px 6px rgba(26,43,76,0.25)">
                          Reset Password
                        </a>
                      </td>
                    </tr>
                  </table>
                  <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6">
                    Atau salin dan buka link berikut di browser Anda:
                  </p>
                  <p style="margin:0 0 16px;word-break:break-all">
                    <a href="${resetLink}" style="color:#1a2b4c;font-size:13px">${resetLink}</a>
                  </p>
                  <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">
                  <p style="margin:0 0 8px;color:#6b7280;font-size:13px;line-height:1.5">
                    Link ini akan kedaluwarsa dalam <strong>15 menit</strong>.
                  </p>
                  <p style="margin:0;color:#6b7280;font-size:13px;line-height:1.5">
                    Jika Anda tidak meminta reset password, abaikan email ini.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="background-color:#f9fafb;padding:16px 24px;text-align:center">
                  <p style="margin:0;color:#9ca3af;font-size:12px">&copy; ${new Date().getFullYear()} Blog Berita. All rights reserved.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: "Reset Password — Blog Berita",
    html,
  });
}

export async function sendVerificationEmail(
  email: string,
  verificationToken: string,
) {
  const frontendUrl = process.env.FRONTEND_URL!;
  const verificationLink = `${frontendUrl}/verify-email?token=${verificationToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0;padding:0;background-color:#f5f6f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f6f8;padding:32px 16px">
        <tr>
          <td align="center">
            <table width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08)">
              <tr>
                <td style="background-color:#1a2b4c;padding:32px 24px;text-align:center">
                  <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700">Verifikasi Email</h1>
                </td>
              </tr>
              <tr>
                <td style="padding:32px 24px">
                  <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6">Halo,</p>
                  <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6">
                    Terima kasih telah mendaftar di Blog Berita.
                    Klik tombol di bawah ini untuk memverifikasi alamat email Anda:
                  </p>
                  <table cellpadding="0" cellspacing="0" style="margin:24px 0">
                    <tr>
                      <td align="center">
                        <a href="${verificationLink}" target="_blank" style="display:inline-block;padding:14px 32px;background-color:#1a2b4c;color:#ffffff;text-decoration:none;border-radius:8px;font-size:15px;font-weight:600;box-shadow:0 2px 6px rgba(26,43,76,0.25)">
                          Verifikasi Email
                        </a>
                      </td>
                    </tr>
                  </table>
                  <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6">
                    Atau salin dan buka link berikut di browser Anda:
                  </p>
                  <p style="margin:0 0 16px;word-break:break-all">
                    <a href="${verificationLink}" style="color:#1a2b4c;font-size:13px">${verificationLink}</a>
                  </p>
                  <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">
                  <p style="margin:0 0 8px;color:#6b7280;font-size:13px;line-height:1.5">
                    Link ini akan kedaluwarsa dalam <strong>24 jam</strong>.
                  </p>
                  <p style="margin:0;color:#6b7280;font-size:13px;line-height:1.5">
                    Jika Anda tidak mendaftar akun Blog Berita, abaikan email ini.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="background-color:#f9fafb;padding:16px 24px;text-align:center">
                  <p style="margin:0;color:#9ca3af;font-size:12px">&copy; ${new Date().getFullYear()} Blog Berita. All rights reserved.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: "Verifikasi Email — Blog Berita",
    html,
  });
}

export async function sendPasswordChangedEmail(email: string, name: string) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0;padding:0;background-color:#f5f6f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f6f8;padding:32px 16px">
        <tr>
          <td align="center">
            <table width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08)">
              <tr>
                <td style="background-color:#1a2b4c;padding:32px 24px;text-align:center">
                  <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700">Password Diubah</h1>
                </td>
              </tr>
              <tr>
                <td style="padding:32px 24px">
                  <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6">Halo ${name},</p>
                  <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6">
                    Password akun Blog Berita Anda telah berhasil diubah.
                  </p>
                  <table cellpadding="0" cellspacing="0" style="margin:24px 0">
                    <tr>
                      <td align="center">
                        <table cellpadding="0" cellspacing="0" style="background-color:#f5f6f8;border-radius:8px;padding:16px 24px">
                          <tr>
                            <td style="color:#6b7280;font-size:13px;padding-bottom:4px">Waktu</td>
                          </tr>
                          <tr>
                            <td style="color:#1a2b4c;font-size:14px;font-weight:600">${new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta", dateStyle: "full", timeStyle: "short" })}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                  <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">
                  <p style="margin:0 0 8px;color:#c8102e;font-size:13px;line-height:1.5">
                    <strong>Bukan Anda?</strong> Jika Anda tidak melakukan perubahan ini,
                    segera reset password Anda melalui halaman lupa password.
                  </p>
                  <p style="margin:0;color:#6b7280;font-size:13px;line-height:1.5">
                    <a href="${process.env.FRONTEND_URL}/auth/forgot-password" style="color:#1a2b4c;font-weight:500">Reset Password Sekarang</a>
                  </p>
                </td>
              </tr>
              <tr>
                <td style="background-color:#f9fafb;padding:16px 24px;text-align:center">
                  <p style="margin:0;color:#9ca3af;font-size:12px">&copy; ${new Date().getFullYear()} Blog Berita. All rights reserved.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: "Password Berhasil Diubah — Blog Berita",
    html,
  });
}
