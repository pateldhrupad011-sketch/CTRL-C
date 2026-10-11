import "server-only";

import nodemailer from "nodemailer";

/**
 * Sends through SMTP when SMTP_HOST, SMTP_USER, SMTP_PASS and MAIL_FROM are set.
 * Without them, emails are printed to the server console so the flow can be tested locally.
 */
export async function sendMail({ to, subject, text }: { to: string; subject: string; text: string }) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !MAIL_FROM) {
    if (process.env.NODE_ENV === "production") throw new Error("Email is not configured (SMTP_* / MAIL_FROM).");
    console.log(`\n[mail] To: ${to}\n[mail] Subject: ${subject}\n${text}\n`);
    return;
  }
  const port = Number(SMTP_PORT || 587);
  const transport = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  await transport.sendMail({ from: MAIL_FROM, to, subject, text });
}
