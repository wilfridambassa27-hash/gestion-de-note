import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import QRCode from 'qrcode'
import { calcMoyenneGenerale, getMention } from '@/lib/gradeCalc'

// GET /api/etudiants/[id]/qrcode?semestreId=xxx
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id: etudiantId } = await params
    const { searchParams } = new URL(request.url)
    const semestreId = searchParams.get('semestreId')

    const etudiant = await prisma.etudiant.findFirst({
      where: { 
        OR: [
          { id: etudiantId },
          { userId: etudiantId }
        ]
      },
      include: {
        user: { select: { nom: true, prenom: true } },
        classe: true,
        notes: {
          where: semestreId ? { semestreId } : {},
          include: { matiere: true, evaluation: true },
        },
      },
    })

    if (!etudiant) {
      return NextResponse.json({ error: 'Étudiant non trouvé' }, { status: 404 })
    }

    const realEtudiantId = etudiant.id

    const noteEntries = etudiant.notes.map(n => ({
      valeur: n.valeur,
      credits: n.matiere?.credits || 1,
      matiereId: n.matiereId,
      evalCoefficient: (n as any).evaluation?.coefficient || 1
    }))
    const moyenne = calcMoyenneGenerale(noteEntries)
    const mention = getMention(moyenne)

    // Create a secure QRCode record in the DB
    const verificationHash = `AUTH-${realEtudiantId.substring(0,8)}-${Date.now()}`
    
    // Dynamically detect host to allow mobile access. 
    // If accessed via localhost on PC, we force the network IP for the QR code so the phone can connect.
    let host = request.headers.get('host') || '192.168.178.149:3000'
    if (host.includes('localhost')) host = '192.168.178.149:3000'
    const protocol = host.includes('192.168') || host.includes('localhost') ? 'http' : 'https'
    const baseUrl = `${protocol}://${host}`
    
    const consultationUrl = `${baseUrl}/verify/releve/${verificationHash}`

    await prisma.qRCode.create({
      data: {
        hash: verificationHash,
        etudiantId: realEtudiantId,
        dateexpiration: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // Valid for 30 days
        statut: 'ACTIF'
      }
    })

    // Generate QR as PNG buffer pointing to the consultation page
    const qrBuffer = await QRCode.toBuffer(consultationUrl, {
      type: 'png',
      width: 300,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })

    return new NextResponse(new Uint8Array(qrBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `inline; filename="qrcode-${etudiant.user.nom}.png"`,
        'Cache-Control': 'public, max-age=3600',
        'X-Etudiant-Nom': `${etudiant.user.prenom} ${etudiant.user.nom}`,
        'X-Moyenne': String(moyenne),
        'X-Mention': mention,
      },
    })
  } catch (error) {
    console.error('QR Code error:', error)
    return NextResponse.json({ error: 'Erreur génération QR code' }, { status: 500 })
  }
}
