import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'

export async function POST(req: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await req.json()
    const { matricule, id_matiere, note, id_semestre, date_saisie, type_evaluation = 'DS', coefficient = 1 } = body

    if (!matricule) return NextResponse.json({ error: 'Identifiant étudiant (matricule) manquant' }, { status: 400 })
    if (!id_matiere) return NextResponse.json({ error: 'Identifiant matière manquant' }, { status: 400 })
    if (note === undefined || note === null) return NextResponse.json({ error: 'Valeur de la note manquante' }, { status: 400 })
    if (!id_semestre) return NextResponse.json({ error: 'Identifiant semestre manquant' }, { status: 400 })

    // On s'assure d'abord que l'Evaluation existe pour cette matière, ce semestre et ce type
    const evaluation = await prisma.evaluation.upsert({
      where: {
        matiereId_semestreId_type: {
          matiereId: id_matiere,
          semestreId: id_semestre,
          type: type_evaluation
        }
      },
      update: {
        coefficient: Number(coefficient)
      },
      create: {
        matiereId: id_matiere,
        semestreId: id_semestre,
        type: type_evaluation,
        coefficient: Number(coefficient),
        date: new Date(date_saisie || new Date())
      }
    })

    // Ensuite, on effectue l'upsert de la note correctement basée sur l'evaluation
    const savedNote = await prisma.note.upsert({
      where: {
        etudiantId_evaluationId: {
          etudiantId: matricule,
          evaluationId: evaluation.id
        }
      },
      update: {
        valeur: parseFloat(note),
        datenote: new Date(date_saisie || new Date())
      },
      create: {
        etudiantId: matricule,
        evaluationId: evaluation.id,
        matiereId: id_matiere,
        semestreId: id_semestre,
        valeur: parseFloat(note),
        datenote: new Date(date_saisie || new Date()),
      }
    })

    // Fetch student info to make the notification clearer. We use evaluation.matiere and session.user.
    const etudiantResult = await prisma.etudiant.findUnique({
      where: { id: matricule },
      include: { user: true }
    });

    const matiereResult = await prisma.matiere.findUnique({
      where: { id: id_matiere }
    });

    // Notify Admins
    try {
      const admins = await prisma.user.findMany({
        where: { role: { in: ['ADMINISTRATEUR', 'admin', 'ADMIN'] } }
      })
      const notifData = admins.map(adm => ({
        userId: adm.id,
        title: 'Nouvelle Note Enregistrée',
        message: `L'enseignant ${session.user.name || 'Inconnu'} a enregistré une note (${note}/20) pour ${etudiantResult?.user?.nom || 'Un Étudiant'} en ${matiereResult?.intitule || 'Matière Inconnue'}.`,
        type: 'SUCCESS'
      }))
      if (notifData.length > 0) {
        await prisma.notification.createMany({ data: notifData })
      }
    } catch(err) {
      console.error('Erreur Notification Admin:', err)
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Note enregistrée dans la session de Rétrographie',
      note: savedNote 
    })
  } catch (error: any) {
    console.error('Erreur Rétrographie Save:', error)
    return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 })
  }
}
