import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import nodemailer from 'nodemailer'

// Generates a readable random password
function generatePassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

async function sendPasswordEmail(to: string, name: string, password: string) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || '',
      pass: process.env.EMAIL_PASS || ''
    }
  })

  await transporter.sendMail({
    from: `"EduNotes Elite" <${process.env.EMAIL_USER}>`,
    to,
    subject: '🎓 Votre accès EduNotes Elite — Mot de passe temporaire',
    html: `
      <div style="font-family:'Segoe UI',sans-serif;max-width:600px;margin:0 auto;background:#f8faff;border-radius:24px;overflow:hidden;">
        <div style="background:#000033;padding:32px;text-align:center;">
          <h1 style="color:#D4AF37;margin:0;font-size:28px;font-weight:900;">EduNotes<span style="color:white">.</span></h1>
          <p style="color:rgba(255,255,255,0.5);font-size:11px;letter-spacing:4px;text-transform:uppercase;margin-top:4px;">ELITE V4.0 — ACCÈS SÉCURISÉ</p>
        </div>
        <div style="padding:40px;">
          <h2 style="color:#000033;font-size:22px;">Bienvenue, ${name} !</h2>
          <p style="color:#64748b;">Votre compte EduNotes a été créé. Voici votre mot de passe temporaire :</p>
          <div style="background:#000033;border-radius:16px;padding:24px;margin:24px 0;text-align:center;">
            <p style="color:#D4AF37;font-size:28px;font-weight:900;letter-spacing:6px;margin:0;font-family:monospace;">${password}</p>
          </div>
          <p style="color:#94a3b8;font-size:13px;">
            Rendez-vous sur <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/confirm-account" style="color:#D4AF37;font-weight:bold;">la page de confirmation</a> pour finaliser votre accès.
          </p>
          <p style="color:#cbd5e1;font-size:11px;margin-top:32px;">Ce message est confidentiel. Ne partagez jamais votre mot de passe.</p>
        </div>
      </div>
    `
  })
}

export async function POST(request: Request) {
  try {
    const { name, email, role } = await request.json()

    if (!email || !name || !role) {
      return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: 'Cet email est déjà utilisé' }, { status: 400 })
    }

    const plainPassword = generatePassword()
    const hashedPassword = await bcrypt.hash(plainPassword, 10)

    type UserRole = 'ADMIN' | 'ENSEIGNANT' | 'ETUDIANT' | 'PARENT'
    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          nom: name.split(' ')[0] || '',
          prenom: name.split(' ').slice(1).join(' ') || name,
          email,
          password: hashedPassword,
          role: role.toUpperCase() as UserRole,
        }
      })

      const matricule = `ELITE-${role.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`

      if (role === 'ENSEIGNANT') {
        await tx.enseignant.create({ data: { userId: user.id, matricule, specialite: 'Général' } })
      } else if (role === 'ETUDIANT') {
        await tx.etudiant.create({ data: { userId: user.id, matricule } })
      } else if (role === 'ADMIN') {
        await tx.administrateur.create({ data: { userId: user.id, niveauprivilege: 'SUPER_ADMIN' } })
      }

      return user
    })

    // Try to send email — gracefully degrade if not configured
    try {
      await sendPasswordEmail(email, name, plainPassword)
    } catch (emailError) {
      console.warn('Email config missing — password not sent by email:', emailError)
    }

    return NextResponse.json({
      success: true,
      userId: newUser.id,
      email: newUser.email,
      // Exposed only in dev so user can log in without email config
      ...(process.env.NODE_ENV !== 'production' && { _devPassword: plainPassword })
    })
  } catch (error) {
    console.error('Erreur registration:', error)
    return NextResponse.json({ error: 'Erreur lors de la création du compte' }, { status: 500 })
  }
}
