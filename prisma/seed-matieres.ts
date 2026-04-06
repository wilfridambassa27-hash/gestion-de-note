import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const filieresMatieres = {
  "Arts & Design": [
    { code: 'ART101', name: "Histoire de l’Art et du Design", credits: 3 },
    { code: 'ART102', name: "Dessin d’observation et croquis", credits: 4 },
    { code: 'ART103', name: "Théorie de la couleur", credits: 3 },
    { code: 'ART104', name: "Design graphique et typographie", credits: 4 },
    { code: 'ART105', name: "Infographie (Photoshop / Illustrator)", credits: 5 },
    { code: 'ART106', name: "Arts plastiques et volume", credits: 3 },
    { code: 'ART107', name: "Sémiologie de l’image", credits: 3 },
    { code: 'ART108', name: "Anglais technique (Arts)", credits: 2 }
  ],
  "Génie Civil et Environnement": [
    { code: 'GCE101', name: "Mathématiques pour l’ingénieur", credits: 4 },
    { code: 'GCE102', name: "Mécanique du point et du solide", credits: 4 },
    { code: 'GCE103', name: "Résistance des Matériaux (RDM)", credits: 5 },
    { code: 'GCE104', name: "Géologie et Géotechnique", credits: 3 },
    { code: 'GCE105', name: "Dessin technique et DAO (AutoCAD)", credits: 4 },
    { code: 'GCE106', name: "Matériaux de construction", credits: 4 },
    { code: 'GCE107', name: "Topographie", credits: 3 },
    { code: 'GCE108', name: "Écologie et Développement durable", credits: 2 }
  ],
  "Génie Électrique et Industrielle": [
    { code: 'GEI101', name: "Algèbre et Analyse", credits: 4 },
    { code: 'GEI102', name: "Électromagnétisme", credits: 4 },
    { code: 'GEI103', name: "Circuits électriques (Courant continu et alternatif)", credits: 5 },
    { code: 'GEI104', name: "Électronique analogique", credits: 4 },
    { code: 'GEI105', name: "Logique combinatoire et séquentielle", credits: 4 },
    { code: 'GEI106', name: "Informatique industrielle (Langage C)", credits: 3 },
    { code: 'GEI107', name: "Mesures électriques et instrumentation", credits: 3 },
    { code: 'GEI108', name: "Hygiène, Sécurité et Environnement (HSE)", credits: 2 }
  ],
  "Génie Industriel et Maintenance": [
    { code: 'GIM101', name: "Maintenance préventive et corrective", credits: 5 },
    { code: 'GIM102', name: "Mécanique générale", credits: 4 },
    { code: 'GIM103', name: "Thermodynamique technique", credits: 4 },
    { code: 'GIM104', name: "Dessin de construction mécanique", credits: 3 },
    { code: 'GIM105', name: "Électricité industrielle", credits: 4 },
    { code: 'GIM106', name: "Technologie des machines", credits: 4 },
    { code: 'GIM107', name: "Organisation et gestion de la maintenance (GMAO)", credits: 4 },
    { code: 'GIM108', name: "Automatisme (API)", credits: 3 }
  ],
  "Génie Logiciel (Software Engineering)": [
    { code: 'GLO101', name: "Algorithmique et Structures de données", credits: 5 },
    { code: 'GLO102', name: "Programmation impérative (C ou Python)", credits: 5 },
    { code: 'GLO103', name: "Architecture des ordinateurs", credits: 3 },
    { code: 'GLO104', name: "Bases de données (Modèle Relationnel & SQL)", credits: 4 },
    { code: 'GLO105', name: "Systèmes d'exploitation (Linux/Windows)", credits: 4 },
    { code: 'GLO106', name: "Développement Web statique (HTML/CSS)", credits: 4 },
    { code: 'GLO107', name: "Mathématiques discrètes", credits: 3 },
    { code: 'GLO108', name: "Méthodologie de programmation", credits: 3 }
  ],
  "Ingénierie": [
    { code: 'ING101', name: "Analyse mathématique", credits: 4 },
    { code: 'ING102', name: "Physique générale (Optique et Thermodynamique)", credits: 4 },
    { code: 'ING103', name: "Chimie des matériaux", credits: 3 },
    { code: 'ING104', name: "Algorithmique et programmation", credits: 4 },
    { code: 'ING105', name: "Statique des systèmes", credits: 4 },
    { code: 'ING106', name: "Communication technique et expression", credits: 2 },
    { code: 'ING107', name: "Économie pour l'ingénieur", credits: 2 },
    { code: 'ING108', name: "Anglais scientifique", credits: 2 }
  ],
  "Médecine": [
    { code: 'MED101', name: "Anatomie humaine", credits: 6 },
    { code: 'MED102', name: "Biologie cellulaire et moléculaire", credits: 5 },
    { code: 'MED103', name: "Histologie et Embryologie", credits: 4 },
    { code: 'MED104', name: "Physiologie humaine", credits: 5 },
    { code: 'MED105', name: "Biochimie médicale", credits: 5 },
    { code: 'MED106', name: "Biophysique", credits: 4 },
    { code: 'MED107', name: "Santé publique et éthique", credits: 2 },
    { code: 'MED108', name: "Terminologie médicale (Français/Latin/Grec)", credits: 2 }
  ]
}

async function main() {
  console.log('🚀 Start Seeding Matieres & ClasseMatiere...')

  const semestres = await prisma.semestre.findMany()
  const semestreS1 = semestres.find(s => s.id === 's1') || { id: 's1' }

  for (const [filiere, matieres] of Object.entries(filieresMatieres)) {
    console.log(`\n📚 Traitement de la filière: ${filiere}`)
    // Fetch classes for this filiere. 
    // In seed.ts, "Génie Électrique et Industriel" was sometimes "Génie Électrique et Industrielle". 
    // We will do a fuzzy match using startsWith or contains if exact match fails
    let classes = await prisma.classe.findMany({
      where: { filiere: filiere }
    })
    
    if (classes.length === 0) {
      // Fuzzy matching fallback
      classes = await prisma.classe.findMany({
        where: { filiere: { contains: filiere.split(' ')[0] } }
      })
      classes = classes.filter(c => c.filiere?.includes(filiere.split(' ')[1]) || filiere.includes(c.filiere as string))
    }

    if (classes.length === 0) {
       console.log(`⚠️ Aucune classe trouvée pour la filière ${filiere}`)
    }

    for (const mat of matieres) {
      // 1. Upsert la Matiere
      const matiere = await prisma.matiere.upsert({
        where: { code: mat.code },
        update: { intitule: mat.name, credits: mat.credits },
        create: {
          id: `mat-${mat.code.toLowerCase()}`,
          code: mat.code,
          intitule: mat.name,
          credits: mat.credits,
          seuilreussite: 10
        }
      })

      // 2. Lier à toutes les classes de la filière
      for (const classe of classes) {
        await prisma.classeMatiere.upsert({
          where: {
            classeId_matiereId_semestre: {
              classeId: classe.id,
              matiereId: matiere.id,
              semestre: semestreS1.id
            }
          },
          update: { heuresprevues: 40 },
          create: {
            classeId: classe.id,
            matiereId: matiere.id,
            semestre: semestreS1.id,
            heuresprevues: 40
          }
        })
      }
      console.log(`   ✔️ Ajout/Link: ${mat.code} - ${mat.name}`)
    }
  }

  console.log('\n✅ Terminé avec succès !')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
