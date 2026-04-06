import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { createLog } from '@/lib/logger'
import { Prisma } from '@prisma/client'

interface Semestre {
  id: string
  libelle: string
  actif: boolean
  anneeacademique: string
}

interface MiniNote {
  id: string
  valeur: number
  credits?: number
  typenote: string
  datenote: Date
  appreciation?: string | null
  matiereId: string
  matiere: {
    id: string
    code: string
    intitule: string
    credits: number
  }
  semestre: {
    id: string
    libelle: string
  }
  saisipar?: {
    user: {
      nom: string
      prenom: string
    }
  } | null
  validee: boolean
  evaluation?: {
    id: string
    type: string
    coefficient: number
  } | null
}

interface MiniEtudiant {
  id: string
  matricule: string
  user: {
    nom: string
    prenom: string
    email: string
    actif: boolean
  }
  notes: MiniNote[]
  classe?: {
    id: string
    nom: string
  }
}

// GET - Récupérer les données rétrographiques
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const classeId = searchParams.get('classeId')
    const semestreId = searchParams.get('semestreId')
    const semestreLibelle = searchParams.get('semestre') // S1, S2, ANNUEL
    const etudiantId = searchParams.get('etudiantId')

    // Récupérer tous les semestres pour le filtre
    const semestres = await prisma.semestre.findMany({
      orderBy: [
        { anneeacademique: 'desc' },
        { libelle: 'asc' }
      ]
    })

    // Trouver le semestre actif par défaut
    let semestreActif = semestres.find((s) => s.actif)
    if (!semestreActif && semestres.length > 0) {
      semestreActif = semestres[0]
    }
    
    // Déterminer quel semestre utiliser
    let semestreSelectionne = semestreActif
    if (semestreId) {
      semestreSelectionne = semestres.find((s) => s.id === semestreId)
    } else if (semestreLibelle && semestreLibelle !== 'ANNUEL') {
      semestreSelectionne = semestres.find((s) => s.libelle === semestreLibelle)
    }

    // Fetch classes avec les matières et les étudiants
    const classes = await prisma.classe.findMany({
      where: { actif: true },
      include: {
        _count: {
          select: { etudiants: true }
        },
        matieres: {
          include: {
            matiere: {
              include: {
                classes: true
              }
            }
          }
        }
      },
      orderBy: { nom: 'asc' }
    })

    // Si une classe spécifique est demandée
    if (classeId) {
      const classe = classes.find((c) => c.id === classeId)
      
      if (!classe) {
        return NextResponse.json(
          { error: 'Classe non trouvée' },
          { status: 404 }
        )
      }

      // Préparer le where pour les notes
      const notesWhere: Prisma.NoteWhereInput = {}
      if (semestreSelectionne) {
        notesWhere.semestreId = semestreSelectionne.id
      }

      // Récupérer les étudiants avec leurs notes
      const etudiants = await (prisma as any).etudiant.findMany({
        where: { classeId },
        include: {
          user: {
            select: { nom: true, prenom: true, email: true, actif: true }
          },
          notes: {
            where: notesWhere,
            include: {
              matiere: true,
              semestre: true,
              evaluation: true,
              saisipar: {
                include: {
                  user: {
                    select: { nom: true, prenom: true }
                  }
                }
              }
            },
            orderBy: { datenote: 'desc' }
          },
          classe: true
        },
        orderBy: {
          user: { nom: 'asc' }
        }
      })

      // Récupérer toutes les matières de la classe
      const matieresClasse = await prisma.classeMatiere.findMany({
        where: { classeId },
        include: {
          matiere: true,
          enseignant: {
            include: {
              user: {
                select: { nom: true, prenom: true }
              }
            }
          }
        }
      })

      // Grouper les matières par type/catégorie
      const matieresParGroupe = grouperMatieresParCategorie(matieresClasse)

      // Calculer les statistiques pour chaque étudiant
      const elevesWithStats = (etudiants as any[]).map((etudiant) => {
        const notesArr = (etudiant.notes || []).map((n: any) => ({
          ...n,
          typenote: n.evaluation?.type || 'CC',
          evaluation: n.evaluation
        })) as any[]
        
        // Calculer la moyenne par matière
        const moyennesParMatiere = calculerMoyennesParMatiere(notesArr)
        
        // Calculer la moyenne générale
        const moyenneGenerale = calculerMoyenneGenerale(notesArr)
        
        // Calculer les crédits
        const { creditsObtenus, creditsTotal } = calculerCredits(notesArr, matieresClasse)
        
        // Calculer les moyennes par groupe de matières
        const moyenneParGroupe = calculerMoyennesParGroupe(notesArr, matieresParGroupe)

        return {
          id: etudiant.id,
          nom: etudiant.user?.nom,
          prenom: etudiant.user?.prenom,
          email: etudiant.user?.email,
          actif: etudiant.user?.actif,
          matricule: etudiant.matricule,
          classe: {
            id: etudiant.classe?.id || etudiant.classeId,
            nom: etudiant.classe?.nom || 'Inconnue'
          },
          notes: notesArr.map((n) => ({
            id: n.id,
            valeur: n.valeur,
            credits: n.matiere.credits,
            typenote: (n as any).evaluation?.type || 'CC',
            datenote: n.datenote,
            appreciation: n.appreciation,
            matiere: {
              id: n.matiere.id,
              code: n.matiere.code,
              intitule: n.matiere.intitule,
              credits: n.matiere.credits
            },
            semestre: {
              id: n.semestre.id,
              libelle: n.semestre.libelle
            },
            saisipar: n.saisipar ? `${n.saisipar.user.nom} ${n.saisipar.user.prenom}` : null,
            validee: n.validee
          })),
          moyenneParMatiere: moyennesParMatiere,
          moyenneGenerale,
          creditsObtenus,
          creditsTotal,
          moyenneParGroupe
        }
      })

      // Trier par moyenne (descending) pour le rang
      elevesWithStats.sort((a, b) => b.moyenneGenerale - a.moyenneGenerale)

      // Ajouter le rang
      const elevesAvecRang = elevesWithStats.map((eleve, index: number) => ({
        ...eleve,
        rang: index + 1
      }))

      // Calculer les statistiques de la classe
      const moyennes = elevesAvecRang.map((e) => e.moyenneGenerale)
      const statsClasse = {
        effectif: elevesAvecRang.length,
        moyenneGenerale: moyennes.length > 0 ? parseFloat((moyennes.reduce((a: number, b: number) => a + b, 0) / moyennes.length).toFixed(2)) : 0,
        moyenneHaute: moyennes.length > 0 ? Math.max(...moyennes) : 0,
        moyenneBasse: moyennes.length > 0 ? Math.min(...moyennes) : 0,
        admis: moyennes.filter((m) => m >= 10).length,
        recalés: moyennes.filter((m) => m < 10).length
      }

      // Calculer les stats par matière
      const statsParMatiere = matieresClasse.map((cm) => {
        const notesMatiere = etudiants.flatMap((e: any) => 
          e.notes.filter((n: any) => n.matiereId === cm.matiereId)
        )
        const valeurs = notesMatiere.map((n: any) => n.valeur)
        
        return {
          matiereId: cm.matiereId,
          matiereNom: cm.matiere.intitule,
          credits: cm.matiere.credits,
          moyenne: valeurs.length > 0 
            ? parseFloat((valeurs.reduce((a: number, b: number) => a + b, 0) / valeurs.length).toFixed(2))
            : 0,
          min: valeurs.length > 0 ? Math.min(...valeurs) : 0,
          max: valeurs.length > 0 ? Math.max(...valeurs) : 0,
          effectif: valeurs.length
        }
      })

      return NextResponse.json({
        classe,
        eleves: elevesAvecRang,
        matieres: matieresClasse.map((cm) => ({
          id: cm.matiere.id,
          code: cm.matiere.code,
          nom: cm.matiere.intitule,
          credits: cm.matiere.credits,
          semestre: cm.semestre,
          enseignant: cm.enseignant ? `${cm.enseignant.user.nom} ${cm.enseignant.user.prenom}` : null
        })),
        matieresParGroupe,
        stats: statsClasse,
        statsParMatiere,
        semestres,
        semestreActif: semestreSelectionne
      })
    }

    // Retourner toutes les classes avec info basique
    const classesWithStats = classes.map((classe) => ({
      id: classe.id,
      nom: classe.nom,
      niveau: classe.niveau,
      filiere: classe.filiere,
      effectif: classe._count.etudiants,
      matieres: classe.matieres.map((cm) => ({
        id: cm.matiere.id,
        nom: cm.matiere.intitule,
        credits: cm.matiere.credits
      }))
    }))

    return NextResponse.json({
      classes: classesWithStats,
      semestres,
      semestreActif
    })
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des données' },
      { status: 500 }
    )
  }
}

// POST - Créer ou mettre à jour des notes
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    // Vérifier que c'est un admin ou secretary
    if (!session || !['ADMIN', 'SECRETAIRE'].includes(session.user?.role || '')) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { notes } = body

    if (!notes || !Array.isArray(notes)) {
      return NextResponse.json(
        { error: 'Données invalides' },
        { status: 400 }
      )
    }

    const createdNotes = await Promise.all(
      notes.map(async (note: any) => {
        const typeEvaluation = note.typenote || 'CC'
        
        let evaluation = await prisma.evaluation.findFirst({
          where: {
            matiereId: note.matiereId,
            semestreId: note.semestreId,
            type: typeEvaluation
          }
        })

        if (!evaluation) {
          evaluation = await prisma.evaluation.create({
            data: {
              type: typeEvaluation,
              matiereId: note.matiereId,
              semestreId: note.semestreId,
              coefficient: typeEvaluation === 'EXAM' ? 2 : 1,
              date: note.datenote ? new Date(note.datenote) : new Date()
            }
          })
        }

        return prisma.note.upsert({
          where: {
            etudiantId_evaluationId: {
              etudiantId: note.etudiantId,
              evaluationId: evaluation.id
            }
          },
          update: {
            valeur: note.valeur,
            appreciation: note.appreciation,
            saisiparId: session.user?.id || null,
            datenote: note.datenote ? new Date(note.datenote) : undefined
          },
          create: {
            valeur: note.valeur,
            datenote: note.datenote ? new Date(note.datenote) : new Date(),
            appreciation: note.appreciation,
            etudiantId: note.etudiantId,
            matiereId: note.matiereId,
            semestreId: note.semestreId,
            evaluationId: evaluation.id,
            saisiparId: session.user?.id || null,
            validee: false
          },
          include: {
            matiere: true,
            etudiant: {
              include: { user: true }
            }
          }
        })
      })
    )

    // Log l'action
    if (session?.user?.id) {
      await createLog({
        userId: session.user.id,
        action: 'UPDATE', // Consistent with other routes
        type: 'NOTE',
        description: `${createdNotes.length} note(s) traitée(s)`,
        details: {
          notesCount: notes.length,
          semestreId: notes[0]?.semestreId
        }
      })
    }

    return NextResponse.json(createdNotes, { status: 201 })
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création des notes' },
      { status: 500 }
    )
  }
}

// PUT - Valider des notes
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !['ADMIN', 'SECRETAIRE'].includes(session.user?.role || '')) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { etudiantId, semestreId, valider } = body

    if (!etudiantId || !semestreId) {
      return NextResponse.json(
        { error: 'ID étudiant et semestre requis' },
        { status: 400 }
      )
    }

    const updatedNotes = await prisma.note.updateMany({
      where: {
        etudiantId,
        semestreId
      },
      data: {
        validee: valider === true,
        valideeparId: session.user?.id || null,
        datevalidation: valider === true ? new Date() : null
      }
    })

    // Log l'action
    if (session?.user?.id) {
      await createLog({
        userId: session.user.id,
        action: 'VALIDATION',
        type: 'NOTE',
        description: `${updatedNotes.count} note(s) ${valider ? 'validée(s)' : 'invalidée(s)'}`,
        details: { etudiantId, semestreId }
      })
    }

    return NextResponse.json({ 
      message: `${updatedNotes.count} note(s) mise(s) à jour`,
      count: updatedNotes.count 
    })
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la validation des notes' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer une note
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !['ADMIN', 'SECRETAIRE'].includes(session.user?.role || '')) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const noteId = searchParams.get('id')

    if (!noteId) {
      return NextResponse.json(
        { error: 'ID de la note requis' },
        { status: 400 }
      )
    }

    const note = await prisma.note.findUnique({
      where: { id: noteId },
      include: { matiere: true }
    })

    if (!note) {
      return NextResponse.json(
        { error: 'Note non trouvée' },
        { status: 404 }
      )
    }

    await prisma.note.delete({
      where: { id: noteId }
    })

    // Log l'action
    if (session?.user?.id) {
      await createLog({
        userId: session.user.id,
        action: 'DELETE',
        type: 'NOTE',
        description: `Note supprimée: ${note.valeur}/20 en ${note.matiere?.intitule}`,
        details: { noteId }
      })
    }

    return NextResponse.json({ message: 'Note supprimée avec succès' })
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la note' },
      { status: 500 }
    )
  }
}

// PATCH - Changer le statut d'un étudiant (actif/inactif)
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !['ADMIN', 'SECRETAIRE'].includes(session.user?.role || '')) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { etudiantId, actif } = body

    if (!etudiantId || actif === undefined) {
      return NextResponse.json(
        { error: 'ID étudiant et statut requis' },
        { status: 400 }
      )
    }

    // Vérifier que l'étudiant existe
    const etudiant = await prisma.etudiant.findUnique({
      where: { id: etudiantId },
      include: { user: true }
    })

    if (!etudiant) {
      return NextResponse.json(
        { error: 'Étudiant non trouvé' },
        { status: 404 }
      )
    }

    // Mettre à jour le statut de l'utilisateur关联
    const updatedUser = await prisma.user.update({
      where: { id: etudiant.userId },
      data: { actif: actif }
    })

    // Log l'action
    if (session?.user?.id) {
      await createLog({
        userId: session.user.id,
        action: actif ? 'CREATE' : 'UPDATE',
        type: 'SYSTEM',
        description: `Étudiant ${etudiant.user.prenom} ${etudiant.user.nom} ${actif ? 'activé' : 'désactivé'}`,
        details: { etudiantId, userId: etudiant.userId, actif }
      })
    }

    return NextResponse.json({ 
      message: `Étudiant ${actif ? 'activé' : 'désactivé'} avec succès`,
      actif: updatedUser.actif
    })
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json(
      { error: 'Erreur lors du changement de statut' },
      { status: 500 }
    )
  }
}

// ===== FONCTIONS UTILITAIRES =====

interface ClasseMatiereWithMatiere {
  matiereId: string
  matiere: {
    id: string
    code: string
    intitule: string
    credits: number
  }
}

// Grouper les matières par catégorie
function grouperMatieresParCategorie(classeMatieres: ClasseMatiereWithMatiere[]) {
  const groupes: { [key: string]: Array<{ id: string; code: string; nom: string; credits: number }> } = {}
  
  classeMatieres.forEach(cm => {
    // Catégoriser selon le code ou le nom de la matière
    const code = cm.matiere.code?.toUpperCase() || ''
    const nom = cm.matiere.intitule?.toUpperCase() || ''
    
    let categorie = 'Autres'
    
    if (code.startsWith('MAT') || nom.includes('MATH')) {
      categorie = 'Mathématiques'
    } else if (code.startsWith('PHY') || nom.includes('PHYSIQUE')) {
      categorie = 'Physique'
    } else if (code.startsWith('CHI') || nom.includes('CHIMIE')) {
      categorie = 'Chimie'
    } else if (code.startsWith('ANG') || nom.includes('ANGLAIS')) {
      categorie = 'Langues'
    } else if (code.startsWith('FR') || nom.includes('FRANCAIS')) {
      categorie = 'Français'
    } else if (code.startsWith('HG') || nom.includes('HISTOIRE') || nom.includes('GEO')) {
      categorie = 'Histoire-Géographie'
    } else if (code.startsWith('PHI') || nom.includes('PHILOSOPHIE')) {
      categorie = 'Philosophie'
    } else if (code.startsWith('SVT') || nom.includes('SCIENCES')) {
      categorie = 'Sciences'
    } else if (code.startsWith('EPS') || nom.includes('SPORT')) {
      categorie = 'EPS'
    }
    
    if (!groupes[categorie]) {
      groupes[categorie] = []
    }
    
    groupes[categorie].push({
      id: cm.matiere.id,
      code: cm.matiere.code,
      nom: cm.matiere.intitule,
      credits: cm.matiere.credits
    })
  })
  
  return Object.entries(groupes).map(([nom, matieres]) => ({
    id: nom,
    nom,
    matieres
  }))
}

// Calculer les moyennes par matière en tenant compte du coefficient d'évaluation
function calculerMoyennesParMatiere(notes: MiniNote[]) {
  const moyennes: { [key: string]: { total: number; evalCoeffSum: number; count: number } } = {}
  
  notes.forEach((note) => {
    const matiereId = note.matiereId
    if (!moyennes[matiereId]) {
      moyennes[matiereId] = { total: 0, evalCoeffSum: 0, count: 0 }
    }
    const evalCoeff = (note as any).evaluation?.coefficient || 1
    moyennes[matiereId].total += note.valeur * evalCoeff
    moyennes[matiereId].evalCoeffSum += evalCoeff
    moyennes[matiereId].count++
  })
  
  const result: { [key: string]: { moyenne: number; count: number } } = {}
  Object.entries(moyennes).forEach(([matiereId, data]) => {
    result[matiereId] = {
      moyenne: data.evalCoeffSum > 0 ? parseFloat((data.total / data.evalCoeffSum).toFixed(2)) : 0,
      count: data.count
    }
  })
  
  return result
}

// Calculer la moyenne générale
function calculerMoyenneGenerale(notes: MiniNote[]): number {
  if (notes.length === 0) return 0
  
  const moyennesMatiere = calculerMoyennesParMatiere(notes)
  
  let totalPoints = 0
  let totalCredits = 0
  
  // on utilise just les matieres présentes dans les notes avec leurs crédits correspondants
  const creditsMap: Record<string, number> = {}
  notes.forEach(note => {
    if(!creditsMap[note.matiereId]) creditsMap[note.matiereId] = note.credits || note.matiere?.credits || 0
  })

  Object.entries(moyennesMatiere).forEach(([matiereId, data]) => {
    const credits = creditsMap[matiereId] || 0
    totalPoints += data.moyenne * credits
    totalCredits += credits
  })
  
  return totalCredits > 0 ? parseFloat((totalPoints / totalCredits).toFixed(2)) : 0
}

// Calculer les crédits
function calculerCredits(notes: MiniNote[], matieresClasse: ClasseMatiereWithMatiere[]) {
  // Calculer les crédits totaux
  const creditsTotal = matieresClasse.reduce((sum, cm) => sum + (cm.matiere.credits || 0), 0)
  
  // Calculer les crédits obtenus (moyenne >= 10)
  const moyennesParMatiere = calculerMoyennesParMatiere(notes)
  let creditsObtenus = 0
  
  matieresClasse.forEach(cm => {
    const matiereId = cm.matiereId
    const moyenne = moyennesParMatiere[matiereId]?.moyenne || 0
    const credits = cm.matiere.credits || 0
    
    if (moyenne >= 10) {
      // Multiplicateur selon la moyenne
      let multiplicateur = 1
      if (moyenne >= 18) multiplicateur = 3
      else if (moyenne >= 16) multiplicateur = 3
      else if (moyenne >= 14) multiplicateur = 2
      else if (moyenne >= 12) multiplicateur = 2
      else if (moyenne >= 10) multiplicateur = 1
      
      creditsObtenus += credits * multiplicateur
    }
  })
  
  return { creditsObtenus, creditsTotal }
}

// Calculer les moyennes par groupe de matières
function calculerMoyennesParGroupe(notes: MiniNote[], groupes: Array<{ id: string; nom: string; matieres: Array<{ id: string; code: string; nom: string; credits: number }> }>) {
  const result: { [key: string]: number } = {}
  const moyennesParMatiere = calculerMoyennesParMatiere(notes)
  
  groupes.forEach((groupe) => {
    let totalPoints = 0
    let totalCredits = 0
    
    groupe.matieres.forEach((matiere) => {
      const dataMoyenne = moyennesParMatiere[matiere.id]
      if (dataMoyenne) {
        const credits = matiere.credits || 0
        totalPoints += dataMoyenne.moyenne * credits
        totalCredits += credits
      }
    })
    
    result[groupe.nom] = totalCredits > 0 ? parseFloat((totalPoints / totalCredits).toFixed(2)) : 0
  })
  
  return result
}

