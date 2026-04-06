import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const engineeringData = [
  {
    filiere: "Génie Civil et Environnement",
    matieres: [
      "Résistance des matériaux (RDM)",
      "Mécanique des sols et géotechnique",
      "Topographie et levés",
      "Béton armé et structures",
      "Matériaux de construction",
      "Hydraulique et assainissement",
      "Gestion de projet BTP",
      "Dessin assisté par ordinateur (DAO/AutoCAD)"
    ]
  },
  {
    filiere: "Génie Logiciel (Software Engineering)",
    matieres: [
      "Algorithmique et structures de données",
      "Programmation orientée objet (Java/C++)",
      "Génie logiciel et UML",
      "Bases de données (SQL/NoSQL)",
      "Développement Web (Front-end/Back-end)",
      "Architectures des systèmes d'exploitation",
      "Cybersécurité et réseaux",
      "Intelligence artificielle"
    ]
  },
  {
    filiere: "Génie Électrique et Informatique Industrielle",
    matieres: [
      "Électrotechnique fondamentale",
      "Électronique analogique et numérique",
      "Automates programmables industriels (API)",
      "Instrumentation et capteurs",
      "Réseaux industriels",
      "Actionneurs et variateurs de vitesse",
      "Commande des machines électriques",
      "Maintenance des systèmes automatisés"
    ]
  },
  {
    filiere: "Génie Industriel et Maintenance",
    matieres: [
      "Maintenance préventive et corrective",
      "Fiabilité et sûreté de fonctionnement",
      "Gestion de production et logistique (GPAO)",
      "Automatismes et robotique industrielle",
      "Métrologie et contrôle qualité",
      "Techniques de soudure et chaudronnerie",
      "Gestion des stocks et flux",
      "Sécurité industrielle (QHSE)"
    ]
  },
  {
    filiere: "Génie Mécatronique",
    matieres: [
      "Modélisation des systèmes mécaniques",
      "Electronique de puissance",
      "Robotique et manipulation",
      "Automatique linéaire et échantillonnée",
      "Capteurs et interfaces",
      "Conception et fabrication assistée (CAO/FAO)",
      "Matériaux intelligents",
      "Systèmes embarqués"
    ]
  }
]

async function main() {
  console.log('Starting seeding...')

  for (const data of engineeringData) {
    console.log(`Processing filière: ${data.filiere}`)
    
    // Create Classes A and B for this filière
    const classNames = [`${data.filiere} A`, `${data.filiere} B`]
    
    for (const className of classNames) {
      const classe = await prisma.classe.create({
        data: {
          nom: className,
          filiere: data.filiere,
          niveau: "Niveau 1", // Default starting level
          anneeacademique: "2025-2026",
          capacitemax: 35, // Default capacity as requested "effectif"
        }
      })

      // Create and associate each matiere to this class
      for (const matName of data.matieres) {
        // Find or create the matiere
        let matiere = await prisma.matiere.findFirst({
          where: { intitule: matName }
        })

        if (!matiere) {
          const code = matName.split(' ').map(w => w[0]).join('').toUpperCase() + Math.floor(Math.random() * 100)
          matiere = await prisma.matiere.create({
            data: {
              code,
              intitule: matName,
            }
          })
        }

        // Associate to class
        await prisma.classeMatiere.upsert({
          where: {
            classeId_matiereId_semestre: {
              classeId: classe.id,
              matiereId: matiere.id,
              semestre: "Semestre 1"
            }
          },
          update: {},
          create: {
            classeId: classe.id,
            matiereId: matiere.id,
            semestre: "Semestre 1",
          }
        })
      }
    }
  }

  console.log('Seeding finished successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
