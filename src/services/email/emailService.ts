import { Resend } from "resend";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendEmail(options: SendEmailOptions) {
  const { to, subject, html } = options;

  const { data, error } = await resend.emails.send({
    from: "Blog Berita <onboarding@resend.dev>",
    to,
    subject,
    html,
  });

  if (error) {
    console.error("[Resend Error]", error);
    throw new Error("Gagal mengirim email. Silakan coba lagi nanti.");
  }

  return data;
}

export async function sendResetPasswordEmail(
  email: string,
  resetToken: string
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
