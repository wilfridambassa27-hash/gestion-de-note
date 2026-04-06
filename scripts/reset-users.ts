import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('--- Démarrage de la migration des utilisateurs ---')
  
  try {
    // 1. Suppression des données dépendantes (avec sécurité si table absente)
    console.log('Nettoyage de la base de données...')
    const modelsToDelete = [
      'contestation', 'qRCode', 'note', 'bulletin', 
      'parent', 'etudiant', 'enseignant', 'administrateur', 
      'log', 'user'
    ]

    for (const model of modelsToDelete) {
      try {
        console.log(`Suppression de ${model}...`)
        await (prisma as any)[model].deleteMany({})
      } catch (e) {
        console.log(`Note: La table ${model} est inaccessible ou absente.`)
      }
    }
    
    console.log('Base de données prête pour les nouveaux comptes.')

    const commonPassword = await hash('12345678', 12)

    // 2. Création de l'Administrateur
    console.log('Création de l\'administrateur : michellemenah@gmail.com')
    await prisma.user.create({
      data: {
        email: 'michellemenah@gmail.com',
        password: commonPassword,
        nom: 'MENAH',
        prenom: 'Michelle',
        role: 'ADMIN',
        actif: true,
        administrateur: {
          create: {
            departement: 'Direction'
          }
        }
      }
    })

    // 3. Création de l'Enseignant
    console.log('Création de l\'enseignant : wilfridambassa@gmail.com')
    await prisma.user.create({
      data: {
        email: 'wilfridambassa@gmail.com',
        password: commonPassword,
        nom: 'AMBASSA',
        prenom: 'Wilfrid',
        role: 'ENSEIGNANT',
        actif: true,
        enseignant: {
          create: {
            matricule: 'WA2026',
            grade: 'Professeur',
            specialite: 'Informatique'
          }
        }
      }
    })

    // 4. Création de l'Étudiant
    console.log('Création de l\'étudiant : erikakouam@gmail.com')
    await prisma.user.create({
      data: {
        email: 'erikakouam@gmail.com',
        password: commonPassword,
        nom: 'KOUAM',
        prenom: 'Erika',
        role: 'ETUDIANT',
        actif: true,
        etudiant: {
          create: {
            matricule: 'EK2026'
          }
        }
      }
    })

    console.log('--- Migration terminée avec succès ---')
  } catch (error) {
    console.error('Erreur lors de la migration :', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
