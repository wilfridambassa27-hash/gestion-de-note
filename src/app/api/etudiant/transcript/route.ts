import { NextResponse } from 'next/server'
import { Prisma, Semestre } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role?.toLowerCase() !== 'etudiant') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const etudiant = await prisma.etudiant.findUnique({
      where: { userId: session.user.id },
      include: {
        user: true,
        classe: true,
        notes: {
          include: {
            matiere: true,
            semestre: true
          },
          orderBy: { datenote: 'desc' }
        }
      }
    })

    if (!etudiant) {
      return NextResponse.json({ error: 'Étudiant non trouvé' }, { status: 404 })
    }

    type NoteWithMatiere = Prisma.NoteGetPayload<{
      include: { matiere: true; semestre: true }
    }>

    interface SemesterGroup {
      semestre: Semestre;
      notes: NoteWithMatiere[];
      moyenne: number;
      creditsTotal: number;
      creditsAcquis: number;
    }

    // Group notes by semester
    const notesBySemester: Record<string, SemesterGroup> = {}
    
    // Also fetch all semestres for this academic year to ensure we have headings even if no notes
    const semestres = await prisma.semestre.findMany({
      where: { anneeacademique: etudiant.classe?.anneeacademique || '2024-2025' },
      orderBy: { datedebut: 'asc' }
    })

    semestres.forEach(sem => {
      notesBySemester[sem.id] = {
        semestre: sem,
        notes: [],
        moyenne: 0,
        creditsTotal: 0,
        creditsAcquis: 0
      }
    })

    etudiant.notes.forEach(note => {
      if (notesBySemester[note.semestreId]) {
        notesBySemester[note.semestreId].notes.push(note)
      }
    })

    // Calculate averages and credits for each semester
    Object.values(notesBySemester).forEach((semGroup) => {
      if (semGroup.notes.length > 0) {
        const sum = semGroup.notes.reduce((acc: number, n) => acc + n.valeur, 0)
        semGroup.moyenne = sum / semGroup.notes.length
        
        semGroup.notes.forEach((n) => {
          const credits = n.matiere?.credits || 0
          semGroup.creditsTotal += credits
          if (n.valeur >= 10) {
            semGroup.creditsAcquis += credits
          }
        })
      }
    })

    // Calculate annual statistics
    const semesterGroups = Object.values(notesBySemester)
    const activeSemesters = semesterGroups.filter(s => s.notes.length > 0)
    const annualMoyenne = activeSemesters.length > 0 
      ? activeSemesters.reduce((acc, s) => acc + s.moyenne, 0) / activeSemesters.length 
      : 0
    const annualCreditsAcquis = semesterGroups.reduce((acc, s) => acc + s.creditsAcquis, 0)
    const annualCreditsTotal = semesterGroups.reduce((acc, s) => acc + s.creditsTotal, 0)

    return NextResponse.json({
      student: {
        nom: etudiant.user.nom,
        prenom: etudiant.user.prenom,
        matricule: etudiant.matricule,
        datenaissance: etudiant.datenaissance,
        lieunaissance: etudiant.lieunaissance,
        classe: etudiant.classe?.nom,
        filiere: etudiant.classe?.filiere,
        niveau: etudiant.classe?.niveau,
        anneeacademique: etudiant.classe?.anneeacademique
      },
      semesters: semesterGroups,
      annualMoyenne,
      annualCreditsAcquis,
      annualCreditsTotal
    })

  } catch (error) {
    console.error('Erreur transcript:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
