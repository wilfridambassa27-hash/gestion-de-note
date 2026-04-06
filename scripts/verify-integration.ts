export {}
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('--- Démarrage de la vérification de l\'intégration UML ---')
  
  try {
    // 1. Vérifier si on peut créer un étudiant test
    const user = await prisma.user.upsert({
      where: { email: 'test@student.com' },
      update: {},
      create: {
        email: 'test@student.com',
        password: 'hashedpassword',
        nom: 'TEST',
        prenom: 'Student',
        role: 'ETUDIANT'
      }
    })

    const etudiant = await prisma.etudiant.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        matricule: 'TEST001',
      }
    })

    console.log('✔ Étudiant test OK')

    // 2. Vérifier si on peut créer un bulletin
    const semestre = await prisma.semestre.findFirst({ where: { actif: true } })
    if (!semestre) {
        console.log('⚠ Aucun semestre actif trouvé pour le test')
        return
    }

    const bulletin = await prisma.bulletin.upsert({
      where: { 
        etudiantId_semestreId: {
          etudiantId: etudiant.id,
          semestreId: semestre.id
        }
      },
      update: {},
      create: {
        etudiantId: etudiant.id,
        semestreId: semestre.id,
        statut: 'BROUILLON'
      }
    })

    console.log('✔ Bulletin test OK')

    // 3. Vérifier la création de QR Code (Simule l'API)
    const qrCode = await prisma.qRCode.create({
      data: {
        hash: 'test-hash-' + Date.now(),
        bulletinId: bulletin.id,
        statut: 'ACTIF'
      }
    })

    console.log('✔ Génération QR Code OK (Hash:', qrCode.hash, ')')

    // 4. Vérifier la création d'une contestation (Simule l'API)
    // On a besoin d'une note d'abord
    const matiere = await prisma.matiere.findFirst()
    if (matiere) {
        const note = await prisma.note.create({
            data: {
                valeur: 15,
                etudiantId: etudiant.id,
                matiereId: matiere.id,
                semestreId: semestre.id,
                typenote: 'DEVOIR',
                bulletinId: bulletin.id
            }
        })

        const contestation = await prisma.contestation.create({
            data: {
                noteId: note.id,
                motif: 'ERREUR_CALCUL',
                description: 'Test de contestation'
            }
        })
        console.log('✔ Mécanisme de contestation OK')
    }

    console.log('\n--- TOUTES LES VÉRIFICATIONS DB ONT RÉUSSI ---')

  } catch (error) {
    console.error('❌ Échec de la vérification:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
