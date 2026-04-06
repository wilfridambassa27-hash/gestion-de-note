import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import QRCode from 'qrcode'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const { etudiantId, semestreId } = await request.json()

    if (!etudiantId) {
      return NextResponse.json(
        { error: 'ID étudiant requis' },
        { status: 400 }
      )
    }

    // 1. Trouver ou créer un bulletin pour cet étudiant et ce semestre
    let bulletin = await prisma.bulletin.findFirst({
      where: {
        etudiantId,
        semestreId: semestreId || undefined, // Optionnel si non fourni
      },
      orderBy: { dategeneration: 'desc' }
    })

    if (!bulletin) {
      // Si pas de semestreId, on prend le premier semestre actif
      const targetSemestreId = semestreId || (await prisma.semestre.findFirst({ where: { actif: true } }))?.id
      
      if (!targetSemestreId) {
        return NextResponse.json({ error: 'Aucun semestre actif trouvé' }, { status: 400 })
      }

      bulletin = await prisma.bulletin.create({
        data: {
          etudiantId,
          semestreId: targetSemestreId,
          statut: 'BROUILLON'
        }
      })
    }

    // 2. Générer un hash unique
    const hash = crypto.randomBytes(16).toString('hex')

    // 3. Sauvegarder le QR Code en base de données
    const qrCodeRecord = await prisma.qRCode.create({
      data: {
        hash,
        bulletinId: bulletin.id,
        dateexpiration: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // Expire dans 30 jours
        statut: 'ACTIF'
      }
    })

    // 4. Générer l'image QR code (contient l'URL vers le résultat)
    // Dynamic host detection for mobile access. Force IP if localhost to ensure phone reachability.
    let host = request.headers.get('host') || '192.168.178.149:3000'
    if (host.includes('localhost')) host = '192.168.178.149:3000'
    const protocol = host.includes('192.168') || host.includes('localhost') ? 'http' : 'https'
    const baseUrl = `${protocol}://${host}`
    
    const qrText = `${baseUrl}/qr-result/${hash}`
    
    const qrCodeDataUrl = await QRCode.toDataURL(qrText, {
      width: 400,
      margin: 2,
      color: {
        dark: '#1D1F10', // Navy-ish from theme
        light: '#ffffff'
      }
    })

    return NextResponse.json({
      success: true,
      hash,
      qrCodeUrl: qrCodeDataUrl,
      qrCodeId: qrCodeRecord.id
    })

  } catch (error) {
    console.error('Erreur génération QR:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la génération du QR code' },
      { status: 500 }
    )
  }
}
