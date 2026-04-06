import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { sendEmailNotification, buildBulletinEmailHtml } from '@/lib/emailNotification'
import { calcMoyenneGenerale, getMention, computeRanks } from '@/lib/gradeCalc'

// POST /api/notifications/send
// Body: { type: 'bulletin_published', classeId, semestreId }
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !['ADMIN', 'ENSEIGNANT', 'SECRETAIRE'].includes(session.user?.role || '')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { type, classeId, semestreId, etudiantId } = body

    if (type === 'bulletin_published') {
      // Fetch all students in the class
      const etudiants = await prisma.etudiant.findMany({
        where: classeId ? { classeId } : etudiantId ? { id: etudiantId } : {},
        include: {
          user: { select: { nom: true, prenom: true, email: true } },
          classe: true,
          notes: {
            where: semestreId ? { semestreId } : {},
            include: { matiere: true, semestre: true },
          },
        },
      })

      const semestre = await prisma.semestre.findUnique({
        where: { id: semestreId },
      })
      const semestreLabel = semestre?.libelle || 'Semestre en cours'

      // Compute moyennes + ranks
      const withMoyenne = etudiants.map(e => {
        const entries = e.notes.map(n => ({
          valeur: n.valeur,
          credits: n.matiere?.credits || 1,
          matiereId: n.matiereId,
        }))
        return { ...e, moyenne: calcMoyenneGenerale(entries) }
      })
      const ranked = computeRanks(withMoyenne)

      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
      let sent = 0
      const errors: string[] = []

      for (const etudiant of ranked) {
        const mention = getMention(etudiant.moyenne)
        const bulletinUrl = `${baseUrl}/api/etudiants/${etudiant.id}/export?format=excel&semestreId=${semestreId}`
        const html = buildBulletinEmailHtml({
          prenom: etudiant.user.prenom,
          nom: etudiant.user.nom,
          classe: etudiant.classe?.nom || '-',
          moyenne: etudiant.moyenne.toFixed(2),
          mention,
          rang: etudiant.rang,
          total: ranked.length,
          semestreLabel,
          bulletinUrl,
        })
        try {
          await sendEmailNotification({
            to: etudiant.user.email,
            subject: `📄 Votre bulletin ${semestreLabel} est disponible — EduNotes`,
            html,
          })
          sent++
        } catch (e) {
          const errMsg = e instanceof Error ? e.message : 'Unknown error'
          errors.push(`${etudiant.user.email}: ${errMsg}`)
        }
      }

      return NextResponse.json({
        success: true,
        sent,
        total: etudiants.length,
        errors,
        message: `${sent}/${etudiants.length} emails envoyés avec succès`,
      })
    }

    if (type === 'custom') {
      // Send custom message to a specific email
      const { to, subject, message: msgBody } = body
      if (!to || !subject || !msgBody) {
        return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
      }
      const html = `
        <div style="font-family:Outfit,sans-serif;padding:32px;max-width:600px;margin:auto">
          <h2 style="color:#4f46e5">EduNotes — Notification</h2>
          <div style="color:#334155;font-size:14px;line-height:1.7">${msgBody.replace(/\n/g, '<br>')}</div>
          <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0"/>
          <p style="color:#94a3b8;font-size:11px">Ce message a été envoyé via EduNotes Elite par ${session.user?.name || 'un administrateur'}.</p>
        </div>
      `
      await sendEmailNotification({ to, subject, html })
      return NextResponse.json({ success: true, message: 'Email envoyé' })
    }

    return NextResponse.json({ error: 'Type de notification inconnu' }, { status: 400 })
  } catch (error) {
    console.error('Notification error:', error)
    return NextResponse.json({ error: "Erreur lors de l'envoi" }, { status: 500 })
  }
}
