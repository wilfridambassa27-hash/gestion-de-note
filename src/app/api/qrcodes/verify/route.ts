import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import jwt from 'jsonwebtoken'

async function verifyHash(hash: string) {
  const qrCode = await prisma.qRCode.findUnique({
    where: { hash },
    select: {
      id: true,
      statut: true,
      dateexpiration: true,
      etudiant: {
        select: {
          id: true,
          matricule: true,
          user: { select: { nom: true, prenom: true } },
          classe: { select: { nom: true } },
          notes: {
            select: {
              id: true,
              valeur: true,
              matiere: { select: { intitule: true, credits: true } },
              evaluation: { select: { type: true } }
            }
          }
        }
      },
      bulletin: {
        select: {
          moyennegenerale: true,
          semestre: { select: { libelle: true } },
          notes: {
            select: {
              id: true,
              valeur: true,
              matiere: { select: { intitule: true, credits: true } },
              evaluation: { select: { type: true } }
            }
          }
        }
      }
    }
  })

  if (!qrCode) return { error: 'QR code invalide', status: 404 }
  if (qrCode.statut !== 'ACTIF' && qrCode.statut !== 'COMPLETED') return { error: 'QR code expiré ou révoqué', status: 403 }
  
  const targetEtudiant = (qrCode.bulletin as any)?.etudiant || qrCode.etudiant
  if (!targetEtudiant) return { error: 'QR code non lié à des données valides', status: 404 }

  if (qrCode.dateexpiration && new Date() > qrCode.dateexpiration) {
    await prisma.qRCode.update({ where: { id: qrCode.id }, data: { statut: 'EXPIRE' } })
    return { error: 'QR code expiré', status: 403 }
  }

  // Update usage stats
  await prisma.qRCode.update({
    where: { id: qrCode.id },
    data: { utilisations: { increment: 1 }, derniereutilisation: new Date() }
  })

  // Data mapping
  const notes = qrCode.bulletin 
    ? qrCode.bulletin.notes.map((n: any) => ({
        id: n.id,
        matiere: n.matiere.intitule,
        valeur: n.valeur,
        credits: n.matiere.credits,
        type: n.evaluation?.type || 'CC'
      }))
    : (targetEtudiant as any).notes.map((n: any) => ({
        id: n.id,
        matiere: n.matiere.intitule,
        valeur: n.valeur,
        credits: n.matiere.credits,
        type: n.evaluation?.type || 'CC'
      }))

  return {
    valid: true,
    etudiant: {
      id: targetEtudiant.id,
      nom: targetEtudiant.user.nom,
      prenom: targetEtudiant.user.prenom,
      matricule: targetEtudiant.matricule,
      classe: targetEtudiant.classe?.nom || 'N/A'
    },
    semestre: (qrCode.bulletin as any)?.semestre?.libelle || 'Consultation Annuelle',
    moyennegenerale: qrCode.bulletin?.moyennegenerale || null,
    notes
  }
}

export async function POST(request: Request) {
  try {
    const { hash } = await request.json()
    if (!hash) return NextResponse.json({ error: 'Hash QR code requis' }, { status: 400 })
    
    const result = await verifyHash(hash)
    if ('error' in result) return NextResponse.json({ error: result.error }, { status: result.status })
    
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    
    if (!token) return NextResponse.json({ error: 'Token requis' }, { status: 400 })
    
    const result = await verifyHash(token)
    if ('error' in result) return NextResponse.json({ error: result.error }, { status: result.status })
    
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
