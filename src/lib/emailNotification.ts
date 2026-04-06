import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

export interface NotificationPayload {
  to: string
  subject: string
  html: string
  attachments?: { filename: string; content: Buffer; contentType: string }[]
}

export async function sendEmailNotification(payload: NotificationPayload): Promise<void> {
  const mailOptions = {
    from: `"EduNotes Elite" <${process.env.EMAIL_USER}>`,
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
    attachments: payload.attachments,
  }

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('[EMAIL] Skipped – EMAIL_USER / EMAIL_PASS not configured.')
    return
  }

  await transporter.sendMail(mailOptions)
}

export function buildBulletinEmailHtml(params: {
  prenom: string
  nom: string
  classe: string
  moyenne: string
  mention: string
  rang: number
  total: number
  semestreLabel: string
  bulletinUrl: string
}): string {
  const { prenom, nom, classe, moyenne, mention, rang, total, semestreLabel, bulletinUrl } = params

  return `
    <!DOCTYPE html>
    <html lang="fr">
    <body style="margin:0;padding:0;background:#f4f6fb;font-family:Outfit,sans-serif">
      <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,.06)">
        <div style="background:linear-gradient(135deg,#0f172a,#1e293b);padding:40px;text-align:center">
          <h1 style="margin:0;color:#fff;font-size:28px;font-weight:900;letter-spacing:-0.5px">EduNotes<span style="color:#6366f1">.</span></h1>
          <p style="margin:8px 0 0;color:#94a3b8;font-size:11px;text-transform:uppercase;letter-spacing:.2em">Relevé de Notes — ${semestreLabel}</p>
        </div>
        <div style="padding:40px">
          <p style="color:#475569;font-size:14px;margin:0 0 24px">Bonjour <strong>${prenom} ${nom}</strong>,</p>
          <p style="color:#475569;font-size:14px;margin:0 0 32px">Votre bulletin pour le <strong>${semestreLabel}</strong> est disponible. Voici votre récapitulatif :</p>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:32px">
            <div style="background:#f8fafc;border-radius:16px;padding:20px;text-align:center">
              <p style="margin:0;font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:.15em;font-weight:700">Classe</p>
              <p style="margin:8px 0 0;font-size:18px;font-weight:900;color:#0f172a">${classe}</p>
            </div>
            <div style="background:#f8fafc;border-radius:16px;padding:20px;text-align:center">
              <p style="margin:0;font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:.15em;font-weight:700">Moyenne</p>
              <p style="margin:8px 0 0;font-size:28px;font-weight:900;color:${parseFloat(moyenne) >= 10 ? '#16a34a' : '#dc2626'}">${moyenne}/20</p>
            </div>
            <div style="background:#f8fafc;border-radius:16px;padding:20px;text-align:center">
              <p style="margin:0;font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:.15em;font-weight:700">Mention</p>
              <p style="margin:8px 0 0;font-size:18px;font-weight:900;color:#6366f1">${mention}</p>
            </div>
            <div style="background:#f8fafc;border-radius:16px;padding:20px;text-align:center">
              <p style="margin:0;font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:.15em;font-weight:700">Rang</p>
              <p style="margin:8px 0 0;font-size:18px;font-weight:900;color:#0f172a">${rang} / ${total}</p>
            </div>
          </div>
          <div style="text-align:center;margin-bottom:32px">
            <a href="${bulletinUrl}" style="display:inline-block;background:#6366f1;color:#fff;padding:16px 40px;border-radius:999px;text-decoration:none;font-weight:900;font-size:13px;letter-spacing:.1em;text-transform:uppercase">
              📄 Télécharger le Bulletin PDF
            </a>
          </div>
          <p style="color:#94a3b8;font-size:11px;text-align:center;margin:0">
            Vous pouvez aussi scanner le QR code sur votre bulletin pour télécharger votre relevé Excel.
          </p>
        </div>
        <div style="background:#f8fafc;padding:20px;text-align:center;border-top:1px solid #e2e8f0">
          <p style="margin:0;color:#64748b;font-size:11px">EduNotes Elite — Plateforme de Gestion Scolaire</p>
        </div>
      </div>
    </body>
    </html>
  `
}
